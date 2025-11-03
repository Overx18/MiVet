import { Op } from 'sequelize';
import db from '../models/index.js';

const { User, Pet, Appointment, Product, Sale, Service } = db;

// Obtener datos agregados para el dashboard según el rol del usuario
export const getDashboardData = async (req, res, next) => {
  const { id: userId, role } = req.user;
  const todayStart = new Date();
  const todayEnd = new Date();
  todayStart.setHours(0, 0, 0, 0);
  todayEnd.setHours(23, 59, 59, 999);

  try {
    let data = {};

    switch (role) {
      case 'Admin': {
        const [userCount, lowStockCount, pendingAppointments, dailyIncome] = await Promise.all([
          User.count({ where: { isActive: true } }),
          Product.count({ where: { quantity: { [Op.lt]: 10 } } }),
          Appointment.count({ where: { status: 'Programada' } }),
          Sale.sum('totalAmount', { where: { status: 'Pagada', createdAt: { [Op.between]: [todayStart, todayEnd] } } }),
        ]);
        data = { userCount, lowStockCount, pendingAppointments, dailyIncome: dailyIncome || 0 };
        break;
      }

        case 'Cliente': {
        const [pets, upcomingAppointments] = await Promise.all([
            Pet.findAll({
            where: { ownerId: userId, isActive: true },
            attributes: ['id', 'name'],
            include: [{ model: db.Species, as: 'species', attributes: ['name'] }],
            }),

            Appointment.findAll({
            where: {
                dateTime: { [Op.gte]: new Date() },
            },
            include: [
                { model: Pet, as: 'pet', where: { ownerId: userId }, attributes: ['name'] },
                { model: Service, as: 'service', attributes: ['name'] },
            ],
            order: [['dateTime', 'ASC']],
            limit: 5,
            }),
        ]);
        data = { pets, upcomingAppointments };
        break;
        }

      case 'Veterinario':
      case 'Groomer': {
        const appointmentsToday = await Appointment.findAll({
          where: {
            professionalId: userId,
            dateTime: { [Op.between]: [todayStart, todayEnd] },
          },
          include: [
            { model: Pet, as: 'pet', attributes: ['name'] },
            { model: Service, as: 'service', attributes: ['name'] },
          ],
          order: [['dateTime', 'ASC']],
        });
        data = { appointmentsToday };
        break;
      }

      case 'Recepcionista': {
        const [pendingAppointmentsCount, lowStockCount, pendingPaymentsCount] = await Promise.all([
          Appointment.count({ where: { status: 'Programada' } }),
          Product.count({ where: { quantity: { [Op.lt]: 10 } } }),
          Sale.count({ where: { status: 'Pendiente' } }),
        ]);
        data = { pendingAppointmentsCount, lowStockCount, pendingPaymentsCount };
        break;
      }

      default:
        return res.status(400).json({ message: 'Rol de usuario no soportado' });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
