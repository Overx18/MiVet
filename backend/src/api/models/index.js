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

// Definición de Asociaciones

// Usuario (Cliente) tiene muchas Mascotas
db.User.hasMany(db.Pet, { foreignKey: 'ownerId', as: 'pets' });
db.Pet.belongsTo(db.User, { foreignKey: 'ownerId', as: 'owner' });

// Especie tiene muchas Mascotas
db.Species.hasMany(db.Pet, { foreignKey: 'speciesId' });
db.Pet.belongsTo(db.Species, { foreignKey: 'speciesId' });

// Mascota tiene muchas Citas
db.Pet.hasMany(db.Appointment, { foreignKey: 'petId' });
db.Appointment.belongsTo(db.Pet, { foreignKey: 'petId' });

// Servicio tiene muchas Citas
db.Service.hasMany(db.Appointment, { foreignKey: 'serviceId' });
db.Appointment.belongsTo(db.Service, { foreignKey: 'serviceId' });

// Usuario (Profesional) tiene muchas Citas
db.User.hasMany(db.Appointment, { foreignKey: 'professionalId', as: 'professionalAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'professionalId', as: 'professional' });

// Cita tiene un Historial Médico
db.Appointment.hasOne(db.MedicalRecord, { foreignKey: 'appointmentId' });
db.MedicalRecord.belongsTo(db.Appointment, { foreignKey: 'appointmentId' });

export default db;