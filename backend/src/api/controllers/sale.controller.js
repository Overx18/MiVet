// backend/src/api/controllers/sale.controller.js
import createError from 'http-errors';
import Stripe from 'stripe';
import { Op } from 'sequelize';
import db from '../models/index.js';
import { config } from '../../config/index.js';

const stripe = new Stripe(config.stripe.secretKey);
const { Sale, SaleDetail, Product, StockTransaction, User } = db;

// Endpoint para obtener solo clientes
export const getClients = async (req, res, next) => {
  try {
    const clients = await User.findAll({
      where: { role: 'Cliente', isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email'],
    });
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};

// Procesar una nueva venta
export const processSale = async (req, res, next) => {
  const { clientId, items, paymentMethod, subtotal, taxAmount, totalAmount } = req.body;
  const sellerId = req.user.id;

  if (!clientId || !items || items.length === 0 || !paymentMethod) {
    return next(createError(400, 'Faltan datos para procesar la venta.'));
  }

  const t = await db.sequelize.transaction();

  try {
    // 1. Validar stock de todos los productos en el carrito
    for (const item of items) {
      if (item.type === 'product') {
        const product = await Product.findByPk(item.id, { transaction: t });
        if (!product || product.quantity < item.quantity) {
          await t.rollback();
          return next(createError(400, `Stock insuficiente para el producto: ${item.name}.`));
        }
      }
    }

    // 2. Crear el registro de la Venta
    const sale = await Sale.create({
      clientId,
      sellerId,
      paymentMethod,
      subtotal,
      taxAmount,
      totalAmount,
      status: 'Pendiente',
    }, { transaction: t });

    // 3. Crear los detalles de la venta y ajustar stock
    for (const item of items) {
      await SaleDetail.create({
        saleId: sale.id,
        productId: item.type === 'product' ? item.id : null,
        serviceId: item.type === 'service' ? item.id : null,
        quantity: item.quantity,
        unitPrice: item.price,
      }, { transaction: t });

      if (item.type === 'product') {
        const product = await Product.findByPk(item.id, { transaction: t, lock: true });
        product.quantity -= item.quantity;
        await product.save({ transaction: t });

        await StockTransaction.create({
          productId: item.id,
          userId: sellerId,
          type: 'Venta',
          quantityChange: -item.quantity,
          reason: `Venta #${sale.id}`,
        }, { transaction: t });
      }
    }

    // 4. Manejar el pago
    if (paymentMethod === 'Efectivo') {
      sale.status = 'Pagada';
      await sale.save({ transaction: t });
      await t.commit();
      res.status(201).json({ message: 'Venta registrada exitosamente.', sale });
    } else if (paymentMethod === 'Tarjeta') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: 'pen',
        metadata: { saleId: sale.id },
      });

      sale.stripePaymentIntentId = paymentIntent.id;
      await sale.save({ transaction: t });
      await t.commit();
      res.status(201).json({ clientSecret: paymentIntent.client_secret, saleId: sale.id });
    }
  } catch (error) {
    await t.rollback();
    next(error);
  }
};