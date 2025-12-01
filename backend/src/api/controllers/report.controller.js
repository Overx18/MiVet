//Lógica para generar reportes
// backend/src/api/controllers/report.controller.js
import createError from 'http-errors';
import { Op } from 'sequelize';
import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';
import db from '../models/index.js';

const { Appointment, Sale, Product, User, Service, StockTransaction } = db;

// Generar reporte de ingresos
export const generateIncomeReport = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, 'Se requieren fechas de inicio y fin.'));
    }

    const where = {
      status: 'Pagada',
      createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] },
    };

    const sales = await Sale.findAll({
      where,
      include: [
        { model: User, as: 'client', attributes: ['firstName', 'lastName'] },
        { model: User, as: 'seller', attributes: ['firstName', 'lastName'] },
      ],
      attributes: ['id', 'totalAmount', 'paymentMethod', 'createdAt'],
    });

    const appointments = await Appointment.findAll({
      where: {
        ...where,
        status: 'Pagada',
      },
      include: [
        { model: Service, as: 'service', attributes: ['name', 'price'] },
      ],
      attributes: ['id', 'totalPrice', 'dateTime'],
    });

    const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    const totalAppointments = appointments.reduce((sum, a) => sum + parseFloat(a.totalPrice), 0);
    const totalIncome = totalSales + totalAppointments;

    const reportData = {
      period: { startDate, endDate },
      summary: {
        totalSales: sales.length,
        totalAppointments: appointments.length,
        totalIncome: totalIncome.toFixed(2),
      },
      sales: sales.map(s => ({
        id: s.id,
        client: `${s.client.firstName} ${s.client.lastName}`,
        amount: parseFloat(s.totalAmount).toFixed(2),
        method: s.paymentMethod,
        date: s.createdAt,
      })),
      appointments: appointments.map(a => ({
        id: a.id,
        service: a.service.name,
        amount: parseFloat(a.totalPrice).toFixed(2),
        date: a.dateTime,
      })),
    };

    if (format === 'pdf') {
      return generatePDF(res, reportData, 'Reporte de Ingresos');
    } else if (format === 'csv') {
      return generateCSV(res, reportData.sales, 'income_report');
    } else {
      res.status(200).json(reportData);
    }
  } catch (error) {
    next(error);
  }
};

// Generar reporte de citas atendidas
export const generateAppointmentsReport = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, 'Se requieren fechas de inicio y fin.'));
    }

    const appointments = await Appointment.findAll({
      where: {
        dateTime: { [Op.between]: [new Date(startDate), new Date(endDate)] },
        status: { [Op.in]: ['Completada', 'Pagada'] },
      },
      include: [
        { model: User, as: 'professional', attributes: ['firstName', 'lastName'] },
        { model: Service, as: 'service', attributes: ['name'] },
      ],
      attributes: ['id', 'dateTime', 'status'],
    });

    const reportData = appointments.map(a => ({
      id: a.id,
      service: a.service.name,
      professional: `${a.professional.firstName} ${a.professional.lastName}`,
      date: a.dateTime,
      status: a.status,
    }));

    if (format === 'pdf') {
      return generatePDF(res, { appointments: reportData }, 'Reporte de Citas');
    } else if (format === 'csv') {
      return generateCSV(res, reportData, 'appointments_report');
    } else {
      res.status(200).json({ total: appointments.length, appointments: reportData });
    }
  } catch (error) {
    next(error);
  }
};

// Generar reporte de inventario
export const generateInventoryReport = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;

    const products = await Product.findAll({
      attributes: ['id', 'name', 'quantity', 'price', 'expiryDate'],
    });

    const lowStock = products.filter(p => p.quantity < 10);

    const expiringProducts = products.filter(p => {
      if (!p.expiryDate) return false;
      const daysToExpire = Math.ceil(
        (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysToExpire > 0 && daysToExpire <= 30;
    });

    const reportData = {
      summary: {
        totalProducts: products.length,
        lowStock: lowStock.length,
        expiringProducts: expiringProducts.length,
      },
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        price: parseFloat(p.price).toFixed(2),
        expirationDate: p.expiryDate, // puedes dejar el nombre "bonito" hacia fuera
      })),
    };

    if (format === 'pdf') {
      return generatePDF(res, reportData, 'Reporte de Inventario');
    } else if (format === 'csv') {
      return generateCSV(res, reportData.products, 'inventory_report');
    } else {
      res.status(200).json(reportData);
    }
  } catch (error) {
    console.error('❌ Error generando reporte de inventario');
    console.error(error);
    next(createError(500, 'Error generando reporte de inventario'));
  }
};

// Generar reporte de usuarios activos
export const generateUsersReport = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;

    const users = await User.findAll({
      where: { isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
    });

    const reportData = users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role,
      registeredAt: u.createdAt,
    }));

    if (format === 'pdf') {
      return generatePDF(res, { users: reportData }, 'Reporte de Usuarios');
    } else if (format === 'csv') {
      return generateCSV(res, reportData, 'users_report');
    } else {
      res.status(200).json({ total: users.length, users: reportData });
    }
  } catch (error) {
    next(error);
  }
};

// Utilidades para generar PDF con diseño profesional
const generatePDF = (res, data, title) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/ /g, '_')}.pdf"`);
  doc.pipe(res);

  // Encabezado
  doc.fillColor('#1F2937')
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('MiVet - Sistema de Gestión Veterinaria', { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(18)
     .fillColor('#3B82F6')
     .text(title, { align: 'center' });
  
  doc.moveDown(0.5);
  doc.fontSize(10)
     .fillColor('#6B7280')
     .text(`Generado el: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}`, { align: 'center' });
  
  doc.moveDown(1.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#E5E7EB');
  doc.moveDown(1);

  // Contenido según el tipo de reporte
  if (data.period) {
    // Reporte de Ingresos
    doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text('Período del Reporte');
    doc.fontSize(11).fillColor('#4B5563').font('Helvetica')
       .text(`Desde: ${new Date(data.period.startDate).toLocaleDateString('es-ES')}  |  Hasta: ${new Date(data.period.endDate).toLocaleDateString('es-ES')}`);
    doc.moveDown(1);

    // Resumen de Ingresos
    doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text('Resumen Ejecutivo');
    doc.moveDown(0.5);
    
    const summaryData = [
      ['Total de Ventas:', data.summary.totalSales.toString()],
      ['Total de Citas:', data.summary.totalAppointments.toString()],
      ['Ingresos Totales:', `S/ ${data.summary.totalIncome}`],
    ];

    summaryData.forEach(([label, value]) => {
      doc.fontSize(11).fillColor('#4B5563').font('Helvetica').text(label, 50, doc.y, { continued: true })
         .fillColor('#059669').font('Helvetica-Bold').text(value, { align: 'right' });
      doc.moveDown(0.5);
    });

    doc.moveDown(1);

    // Tabla de Ventas
    if (data.sales.length > 0) {
      doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text('Detalle de Ventas');
      doc.moveDown(0.5);
      generateTable(doc, data.sales, ['ID', 'Cliente', 'Monto', 'Método', 'Fecha']);
    }

    doc.moveDown(1);

    // Tabla de Citas
    if (data.appointments.length > 0) {
      doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text('Detalle de Citas');
      doc.moveDown(0.5);
      generateTable(doc, data.appointments, ['ID', 'Servicio', 'Monto', 'Fecha']);
    }
  } else if (data.appointments) {
    // Reporte de Citas
    doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text(`Total de Citas: ${data.appointments.length}`);
    doc.moveDown(1);
    generateTable(doc, data.appointments, ['ID', 'Servicio', 'Profesional', 'Fecha', 'Estado']);
  } else if (data.summary && data.products) {
    // Reporte de Inventario
    doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text('Resumen de Inventario');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#4B5563').font('Helvetica')
       .text(`Total de Productos: ${data.summary.totalProducts}`)
       .text(`Productos con Stock Bajo: ${data.summary.lowStock}`)
       .text(`Productos Próximos a Vencer: ${data.summary.expiringProducts}`);
    doc.moveDown(1);
    generateTable(doc, data.products, ['ID', 'Producto', 'Stock', 'Precio', 'Vencimiento']);
  } else if (data.users) {
    // Reporte de Usuarios
    doc.fontSize(14).fillColor('#1F2937').font('Helvetica-Bold').text(`Total de Usuarios: ${data.users.length}`);
    doc.moveDown(1);
    generateTable(doc, data.users, ['ID', 'Nombre', 'Email', 'Rol', 'Registro']);
  }

  // Pie de página
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor('#9CA3AF').text(
      `Página ${i + 1} de ${pageCount}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }

  doc.end();
};

// Función auxiliar para generar tablas en PDF
const generateTable = (doc, data, headers) => {
  const tableTop = doc.y;
  const itemHeight = 25;
  const columnWidth = 500 / headers.length;

  // Encabezados de la tabla
  headers.forEach((header, i) => {
    doc.fontSize(10)
       .fillColor('#FFFFFF')
       .rect(50 + i * columnWidth, tableTop, columnWidth, itemHeight)
       .fill('#3B82F6')
       .fillColor('#FFFFFF')
       .text(header, 50 + i * columnWidth + 5, tableTop + 8, { width: columnWidth - 10, align: 'left' });
  });

  doc.moveDown();

  // Filas de datos
  data.slice(0, 20).forEach((row, index) => {
    const y = tableTop + (index + 1) * itemHeight;
    const values = Object.values(row);
    
    // Alternar colores de fila
    if (index % 2 === 0) {
      doc.rect(50, y, 500, itemHeight).fill('#F9FAFB');
    }

    values.forEach((value, i) => {
      if (i < headers.length) {
        const displayValue = value ? (value instanceof Date ? value.toLocaleDateString('es-ES') : value.toString()) : 'N/A';
        doc.fontSize(9)
           .fillColor('#374151')
           .text(displayValue, 50 + i * columnWidth + 5, y + 8, { width: columnWidth - 10, ellipsis: true });
      }
    });
  });

  if (data.length > 20) {
    doc.moveDown();
    doc.fontSize(9).fillColor('#6B7280').text(`... y ${data.length - 20} registros más`, { align: 'center' });
  }

  doc.moveDown(1);
};

// Utilidades para generar CSV
const generateCSV = async (res, data, filename) => {
  if (!data || data.length === 0) {
    return res.status(400).json({ message: 'No hay datos para exportar' });
  }

  const headers = Object.keys(data[0]).map(key => ({ id: key, title: key.toUpperCase() }));
  const filePath = path.join(process.cwd(), `${filename}.csv`);

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await csvWriter.writeRecords(data);
  res.download(filePath, () => fs.unlinkSync(filePath));
};