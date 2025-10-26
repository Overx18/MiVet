// backend/src/api/controllers/product.controller.js
import createError from 'http-errors';
import db from '../models/index.js';
import { Op } from 'sequelize';

const Product = db.Product;

// [Admin, Recepcionista] Crear un nuevo producto
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, quantity, price, provider, expiryDate } = req.body;

    // Validación de campos obligatorios
    if (!name || quantity === undefined || price === undefined) {
      return next(createError(400, 'Nombre, cantidad y precio son obligatorios.'));
    }

    // Validación de tipos de datos
    if (isNaN(parseFloat(price)) || isNaN(parseInt(quantity))) {
      return next(createError(400, 'Precio y cantidad deben ser números válidos.'));
    }

    const newProduct = await Product.create({
      name,
      description,
      quantity,
      price,
      provider,
      expiryDate,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    // Manejar error de unicidad si el nombre del producto debe ser único
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(createError(409, 'Un producto con ese nombre ya existe.'));
    }
    next(error);
  }
};

// [Admin, Recepcionista, Veterinario] Obtener lista de productos con filtros y paginación
export const getAllProducts = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, name, lowStock, expiringSoon } = req.query;
      const offset = (page - 1) * limit;
  
      const where = {};
  
      // Filtro por nombre
      if (name) {
        where.name = { [Op.like]: `%${name}%` };
      }
  
      // Filtro por stock bajo (< 10)
      if (lowStock === 'true') {
        where.quantity = { [Op.lt]: 10 };
      }
  
      // Filtro por caducidad próxima (< 30 días)
      if (expiringSoon === 'true') {
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        where.expiryDate = {
          [Op.between]: [new Date(), in30Days],
        };
      }
  
      const { count, rows } = await Product.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']],
      });
  
      res.status(200).json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        products: rows,
      });
    } catch (error) {
      next(error);
    }
  };

  // [Admin, Recepcionista] Actualizar el stock de un producto
export const updateStock = async (req, res, next) => {
  const { id } = req.params;
  const { quantityChange, type, reason } = req.body;
  const userId = req.user.id;

  if (!quantityChange || !type) {
    return next(createError(400, 'El cambio de cantidad y el tipo son obligatorios.'));
  }

  const t = await db.sequelize.transaction();

  try {
    const product = await Product.findByPk(id, { transaction: t, lock: true });

    if (!product) {
      await t.rollback();
      return next(createError(404, 'Producto no encontrado.'));
    }

    // Bloqueo si se intenta sacar más stock del disponible
    if (product.quantity + quantityChange < 0) {
      await t.rollback();
      return next(createError(400, 'Stock insuficiente para realizar la operación.'));
    }

    // 1. Actualizar la cantidad del producto
    product.quantity += quantityChange;
    await product.save({ transaction: t });

    // 2. Crear el registro de la transacción
    await db.StockTransaction.create({
      productId: id,
      userId,
      quantityChange,
      type,
      reason,
    }, { transaction: t });

    // Si todo fue bien, confirmar la transacción
    await t.commit();

    res.status(200).json(product);
  } catch (error) {
    // Si algo falla, revertir todo
    await t.rollback();
    next(error);
  }
};