//Inicializa Sequelize y asocia los modelos
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

// Definición de Asociaciones

// Usuario (Cliente) tiene muchas Mascotas
db.User.hasMany(db.Pet, { foreignKey: 'ownerId', as: 'pets' });
db.Pet.belongsTo(db.User, { foreignKey: 'ownerId', as: 'owner' });

// Especie tiene muchas Mascotas
db.Species.hasMany(db.Pet, { foreignKey: 'speciesId', as: 'pets' });
db.Pet.belongsTo(db.Species, { foreignKey: 'speciesId', as: 'species' });

// Mascota tiene muchas Citas
db.Pet.hasMany(db.Appointment, { foreignKey: 'petId', as: 'appointments' });
db.Appointment.belongsTo(db.Pet, { foreignKey: 'petId', as: 'pet' });

// Servicio tiene muchas Citas
db.Service.hasMany(db.Appointment, { foreignKey: 'serviceId', as: 'appointments' });
db.Appointment.belongsTo(db.Service, { foreignKey: 'serviceId', as: 'service' });

// Usuario (Profesional) tiene muchas Citas
db.User.hasMany(db.Appointment, { foreignKey: 'professionalId', as: 'professionalAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'professionalId', as: 'professional' });

// Cita tiene un Historial Médico
db.Appointment.hasOne(db.MedicalRecord, { foreignKey: 'appointmentId', as: 'medicalRecord' });
db.MedicalRecord.belongsTo(db.Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Producto tiene muchas Transacciones de Stock
db.Product.hasMany(db.StockTransaction, { foreignKey: 'productId', as: 'stockTransactions' });
db.StockTransaction.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

// Usuario (quien realiza la transacción) tiene muchas Transacciones
db.User.hasMany(db.StockTransaction, { foreignKey: 'userId', as: 'stockTransactions' });
db.StockTransaction.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Venta pertenece a un Cliente (User) y a un Vendedor (User)
db.User.hasMany(db.Sale, { foreignKey: 'clientId', as: 'clientSales' });
db.Sale.belongsTo(db.User, { foreignKey: 'clientId', as: 'client' });
db.User.hasMany(db.Sale, { foreignKey: 'sellerId', as: 'sellerSales' });
db.Sale.belongsTo(db.User, { foreignKey: 'sellerId', as: 'seller' });

// Venta tiene muchos Detalles de Venta
db.Sale.hasMany(db.SaleDetail, { foreignKey: 'saleId', as: 'details' });
db.SaleDetail.belongsTo(db.Sale, { foreignKey: 'saleId', as: 'sale' });

// Detalle de Venta puede ser un Producto o un Servicio
db.Product.hasMany(db.SaleDetail, { foreignKey: 'productId' });
db.SaleDetail.belongsTo(db.Product, { foreignKey: 'productId' });
db.Service.hasMany(db.SaleDetail, { foreignKey: 'serviceId' });
db.SaleDetail.belongsTo(db.Service, { foreignKey: 'serviceId' });

export default db;