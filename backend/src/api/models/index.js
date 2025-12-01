// backend/src/api/models/index.js
import { Sequelize } from 'sequelize';
import sequelize from '../../config/database.js';
import UserModel from './user.model.js';
import PetModel from './pet.model.js';
import SpeciesModel from './species.model.js';
import ServiceModel from './service.model.js';
import AppointmentModel from './appointment.model.js';
import ProductModel from './product.model.js';
import MedicalRecordModel from './medicalRecord.model.js';
import StockTransactionModel from './stockTransaction.model.js';
import SaleModel from './sale.model.js';
import SaleDetailModel from './saleDetail.model.js';
import MedicalRecordProductModel from './medicalRecordProduct.model.js';

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Inicialización de modelos
db.User = UserModel(sequelize);
db.Pet = PetModel(sequelize);
db.Species = SpeciesModel(sequelize);
db.Service = ServiceModel(sequelize);
db.Appointment = AppointmentModel(sequelize);
db.Product = ProductModel(sequelize);
db.MedicalRecord = MedicalRecordModel(sequelize);
db.StockTransaction = StockTransactionModel(sequelize);
db.Sale = SaleModel(sequelize);
db.SaleDetail = SaleDetailModel(sequelize);
db.MedicalRecordProduct = MedicalRecordProductModel(sequelize);

// ==========================================
// DEFINICIÓN DE ASOCIACIONES
// ==========================================

// --- Usuario y Mascotas ---
// Usuario (Cliente) tiene muchas Mascotas
db.User.hasMany(db.Pet, { foreignKey: 'ownerId', as: 'pets' });
db.Pet.belongsTo(db.User, { foreignKey: 'ownerId', as: 'owner' });

// --- Especie y Mascotas ---
db.Species.hasMany(db.Pet, { foreignKey: 'speciesId', as: 'pets' });
db.Pet.belongsTo(db.Species, { foreignKey: 'speciesId', as: 'species' });

// --- Mascota y Citas ---
db.Pet.hasMany(db.Appointment, { foreignKey: 'petId', as: 'appointments' });
db.Appointment.belongsTo(db.Pet, { foreignKey: 'petId', as: 'pet' });

// --- Servicio y Citas ---
db.Service.hasMany(db.Appointment, { foreignKey: 'serviceId', as: 'appointments' });
db.Appointment.belongsTo(db.Service, { foreignKey: 'serviceId', as: 'service' });

// --- Usuario (Profesional) y Citas ---
db.User.hasMany(db.Appointment, { foreignKey: 'professionalId', as: 'professionalAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'professionalId', as: 'professional' });

// --- Cita e Historial Médico ---
db.Appointment.hasOne(db.MedicalRecord, { foreignKey: 'appointmentId', as: 'medicalRecord' });
db.MedicalRecord.belongsTo(db.Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// --- Historial Médico y Productos (Relación N:M) ---
db.MedicalRecord.belongsToMany(db.Product, { through: db.MedicalRecordProduct, foreignKey: 'medicalRecordId', as: 'products' });
db.Product.belongsToMany(db.MedicalRecord, { through: db.MedicalRecordProduct, foreignKey: 'productId', as: 'medicalRecords' });

// --- Producto y Stock ---
db.Product.hasMany(db.StockTransaction, { foreignKey: 'productId', as: 'stockTransactions' });
db.StockTransaction.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

// --- Usuario y Stock ---
db.User.hasMany(db.StockTransaction, { foreignKey: 'userId', as: 'stockTransactions' });
db.StockTransaction.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// --- Ventas ---
// Cliente de la venta
db.User.hasMany(db.Sale, { foreignKey: 'clientId', as: 'clientSales' });
db.Sale.belongsTo(db.User, { foreignKey: 'clientId', as: 'client' });
// Vendedor de la venta
db.User.hasMany(db.Sale, { foreignKey: 'sellerId', as: 'sellerSales' });
db.Sale.belongsTo(db.User, { foreignKey: 'sellerId', as: 'seller' });

// --- Venta y Detalles ---
db.Sale.hasMany(db.SaleDetail, { foreignKey: 'saleId', as: 'details' });
db.SaleDetail.belongsTo(db.Sale, { foreignKey: 'saleId', as: 'sale' });

// --- Detalles de Venta (Polimorfismo simplificado o referencias directas) ---
db.Product.hasMany(db.SaleDetail, { foreignKey: 'productId' });
db.SaleDetail.belongsTo(db.Product, { foreignKey: 'productId' });

db.Service.hasMany(db.SaleDetail, { foreignKey: 'serviceId' });
db.SaleDetail.belongsTo(db.Service, { foreignKey: 'serviceId' });

export default db;