// backend/src/api/controllers/dashboard.controller.js
import { Op } from 'sequelize';
import db from '../models/index.js';

const { User, Pet, Appointment, Product, Sale, MedicalRecord, Service, sequelize } = db;

export const getDashboardData = async (req, res, next) => {
  const { id: userId, role } = req.user;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    let data = {};

    switch (role) {
      case 'Admin': {
        // ... (La lógica de Admin no tiene includes complejos que fallen, se mantiene igual)
        // Período para comparaciones (último mes vs mes anterior)
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        lastMonthStart.setHours(0, 0, 0, 0);

        const previousMonthStart = new Date();
        previousMonthStart.setMonth(previousMonthStart.getMonth() - 2);
        previousMonthStart.setHours(0, 0, 0, 0);

        const [
          userCount,
          newUsersThisMonth,
          lowStockCount,
          criticalStockCount,
          pendingAppointments,
          totalAppointments,
          dailyIncome,
          monthlyIncome,
          previousMonthIncome,
          totalPets,
          activePets,
          completedAppointmentsToday,
          totalServices,
          recentSales,
          topServices,
          usersByRole,
          appointmentsByStatus,
        ] = await Promise.all([
          // Usuarios
          User.count({ where: { isActive: true } }),
          User.count({ 
            where: { 
              isActive: true,
              createdAt: { [Op.gte]: lastMonthStart }
            } 
          }),

          // Inventario
          Product.count({ where: { quantity: { [Op.lt]: 10 } } }),
          Product.count({ where: { quantity: { [Op.lt]: 5 } } }),

          // Citas
          Appointment.count({ 
            where: { 
              status: 'Pagada', 
              dateTime: { [Op.gte]: new Date() } 
            } 
          }),
          Appointment.count(),

          // Ingresos
          Sale.sum('totalAmount', { 
            where: { 
              status: 'Pagada', 
              createdAt: { [Op.between]: [todayStart, todayEnd] } 
            } 
          }),
          Sale.sum('totalAmount', {
            where: {
              status: 'Pagada',
              createdAt: { [Op.gte]: lastMonthStart }
            }
          }),
          Sale.sum('totalAmount', {
            where: {
              status: 'Pagada',
              createdAt: { [Op.between]: [previousMonthStart, lastMonthStart] }
            }
          }),

          // Mascotas
          Pet.count({ where: { isActive: true } }),
          Pet.count({
            where: {
              isActive: true,
              createdAt: { [Op.gte]: lastMonthStart }
            }
          }),

          // Citas completadas hoy
          Appointment.count({ 
            where: { 
              status: 'Completada', 
              dateTime: { [Op.between]: [todayStart, todayEnd] } 
            } 
          }),

          // Servicios
          Service.count(),

          // Ventas recientes
          Sale.findAll({
            where: { 
              status: 'Pagada',
              createdAt: { [Op.between]: [todayStart, todayEnd] }
            },
            include: [
              { 
                model: User, 
                as: 'client', // Correcto según index.js
                attributes: ['firstName', 'lastName'],
                required: false
              }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
          }),

          // Top servicios
          sequelize.query(`
            SELECT 
              s.name as serviceName,
              COUNT(a.id) as count,
              SUM(a.totalPrice) as revenue
            FROM Appointments a
            JOIN Services s ON a.serviceId = s.id
            WHERE a.status IN ('Completada', 'Pagada')
            AND a.dateTime >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY s.id, s.name
            ORDER BY count DESC
            LIMIT 5
          `, { type: sequelize.QueryTypes.SELECT }),

          // Usuarios por rol
          sequelize.query(`
            SELECT 
              role,
              COUNT(*) as count
            FROM Users
            WHERE isActive = 1
            GROUP BY role
          `, { type: sequelize.QueryTypes.SELECT }),

          // Citas por estado
          sequelize.query(`
            SELECT 
              status,
              COUNT(*) as count
            FROM Appointments
            WHERE dateTime >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY status
          `, { type: sequelize.QueryTypes.SELECT }),
        ]);

        // Estadísticas de citas por mes (últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const appointmentsByMonth = await Appointment.findAll({
          where: { 
            dateTime: { [Op.gte]: sixMonthsAgo },
            status: { [Op.in]: ['Completada', 'Pagada'] }
          },
          attributes: [
            [sequelize.fn('DATE_FORMAT', sequelize.col('dateTime'), '%Y-%m'), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: [sequelize.fn('DATE_FORMAT', sequelize.col('dateTime'), '%Y-%m')],
          order: [[sequelize.fn('DATE_FORMAT', sequelize.col('dateTime'), '%Y-%m'), 'ASC']]
        });

        // Ingresos por mes (últimos 6 meses)
        const incomeByMonth = await Sale.findAll({
          where: {
            status: 'Pagada',
            createdAt: { [Op.gte]: sixMonthsAgo }
          },
          attributes: [
            [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
            [sequelize.fn('SUM', sequelize.col('totalAmount')), 'income']
          ],
          group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
          order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']]
        });

        // Calcular tendencias
        const monthlyGrowth = previousMonthIncome > 0 
          ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome * 100).toFixed(1)
          : 0;

        data = {
          userCount,
          newUsersThisMonth,
          lowStockCount,
          criticalStockCount,
          pendingAppointments,
          totalAppointments,
          dailyIncome: parseFloat(dailyIncome || 0).toFixed(2),
          monthlyIncome: parseFloat(monthlyIncome || 0).toFixed(2),
          monthlyGrowth: parseFloat(monthlyGrowth),
          totalPets,
          activePets,
          completedAppointmentsToday,
          totalServices,
          recentSales: recentSales.map(s => ({
            id: s.id,
            client: s.client ? `${s.client.firstName} ${s.client.lastName}` : 'Cliente General',
            amount: parseFloat(s.totalAmount).toFixed(2),
            date: s.createdAt,
            paymentMethod: s.paymentMethod
          })),
          topServices: topServices.map(ts => ({
            name: ts.serviceName,
            count: parseInt(ts.count),
            revenue: parseFloat(ts.revenue || 0).toFixed(2)
          })),
          usersByRole: usersByRole.map(ur => ({
            role: ur.role,
            count: parseInt(ur.count)
          })),
          appointmentsByStatus: appointmentsByStatus.map(as => ({
            status: as.status,
            count: parseInt(as.count)
          })),
          appointmentsByMonth: appointmentsByMonth.map(a => ({
            month: a.get('month'),
            count: parseInt(a.get('count'))
          })),
          incomeByMonth: incomeByMonth.map(i => ({
            month: i.get('month'),
            income: parseFloat(i.get('income')).toFixed(2)
          }))
        };
        break;
      }

      case 'Cliente': {
        const [
          pets, 
          upcomingAppointments, 
          recentMedicalRecords,
          totalAppointments,
          completedAppointments,
          pendingPayments,
          nextAppointment
        ] = await Promise.all([
          // Mascotas activas
          Pet.findAll({ 
            where: { ownerId: userId, isActive: true },
            include: [{ 
              model: db.Species, 
              as: 'species', // Correcto
              attributes: ['name'] 
            }],
            attributes: ['id', 'name', 'age', 'weight', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 10
          }),
          
          // Próximas citas (limitadas a 5)
          Appointment.findAll({
            where: { 
              dateTime: { [Op.gte]: new Date() },
              status: { [Op.in]: ['Pagada', 'Pendiente'] }
            },
            include: [
              { 
                model: Pet, 
                as: 'pet', // <--- AGREGADO: Es obligatorio por index.js
                where: { ownerId: userId },
                attributes: ['name'],
                required: true
              },
              { 
                model: Service, 
                as: 'service', // <--- AGREGADO: Es obligatorio
                attributes: ['name', 'price', 'duration'] 
              },
              { 
                model: User, 
                as: 'professional', 
                attributes: ['firstName', 'lastName'] 
              }
            ],
            order: [['dateTime', 'ASC']],
            limit: 5
          }),

          // Historial médico reciente (últimos 3 registros)
          MedicalRecord.findAll({
            include: [
              {
                model: Appointment,
                as: 'appointment',
                required: true,
                include: [
                  { 
                    model: Pet, 
                    as: 'pet', // <--- AGREGADO
                    where: { ownerId: userId },
                    attributes: ['name'],
                    required: true
                  },
                  { 
                    model: Service, 
                    as: 'service', // <--- AGREGADO
                    attributes: ['name'] 
                  }
                ]
              }
            ],
            order: [['createdAt', 'DESC']],
            limit: 3
          }),

          // Total de citas del cliente
          Appointment.count({
            include: [{
              model: Pet,
              as: 'pet', // <--- AGREGADO
              where: { ownerId: userId },
              attributes: []
            }]
          }),

          // Citas completadas
          Appointment.count({
            where: { status: 'Completada' },
            include: [{
              model: Pet,
              as: 'pet', // <--- AGREGADO
              where: { ownerId: userId },
              attributes: []
            }]
          }),

          // Pagos pendientes
          Appointment.count({
            where: { status: 'Pendiente' },
            include: [{
              model: Pet,
              as: 'pet', // <--- AGREGADO
              where: { ownerId: userId },
              attributes: []
            }]
          }),

          // Próxima cita más cercana
          Appointment.findOne({
            where: { 
              dateTime: { [Op.gte]: new Date() },
              status: 'Pagada'
            },
            include: [
              { 
                model: Pet, 
                as: 'pet', // <--- AGREGADO
                where: { ownerId: userId },
                attributes: ['name'],
                required: true
              },
              { 
                model: Service, 
                as: 'service', // <--- AGREGADO
                attributes: ['name'] 
              }
            ],
            order: [['dateTime', 'ASC']]
          })
        ]);

        data = {
          // Estadísticas generales
          stats: {
            totalPets: pets.length,
            totalAppointments,
            completedAppointments,
            pendingPayments,
            nextAppointmentDate: nextAppointment ? nextAppointment.dateTime : null,
            nextAppointmentPet: nextAppointment ? nextAppointment.pet?.name : null, // Ajustado minuscula .pet
            nextAppointmentService: nextAppointment ? nextAppointment.service?.name : null // Ajustado minuscula .service
          },

          // Mascotas
          pets: pets.map(p => ({
            id: p.id,
            name: p.name,
            species: p.species?.name || 'No especificado',
            age: p.age,
            weight: p.weight,
            daysRegistered: Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24))
          })),

          // Próximas citas
          upcomingAppointments: upcomingAppointments.map(a => ({
            id: a.id,
            pet: { 
              name: a.pet.name, // Ajustado .pet
            },
            service: {
              name: a.service.name, // Ajustado .service
              duration: a.service.duration,
              price: parseFloat(a.service.price).toFixed(2)
            },
            professional: `${a.professional.firstName} ${a.professional.lastName}`,
            dateTime: a.dateTime,
            status: a.status,
            totalPrice: parseFloat(a.totalPrice || a.service.price).toFixed(2)
          })),

          // Historial médico reciente
          recentMedicalRecords: recentMedicalRecords.map(r => ({
            id: r.id,
            pet: {
              name: r.appointment.pet.name, // Ajustado .pet
            },
            service: r.appointment.service.name, // Ajustado .service
            diagnosis: r.diagnosis ? 
              (r.diagnosis.substring(0, 100) + (r.diagnosis.length > 100 ? '...' : '')) : 
              'Sin diagnóstico registrado',
            treatment: r.treatment?.substring(0, 80),
            date: r.createdAt,
            weight: r.weight,
            temperature: r.temperature
          }))
        };
        break;
      }

      case 'Veterinario':
      case 'Groomer': {
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        lastWeekStart.setHours(0, 0, 0, 0);

        const [
          appointmentsToday, 
          upcomingAppointments, 
          completedToday,
          completedThisWeek,
          totalPatients,
          recentMedicalRecords,
          appointmentStats
        ] = await Promise.all([
          // Citas de hoy
          Appointment.findAll({
            where: { 
              professionalId: userId, 
              dateTime: { [Op.between]: [todayStart, todayEnd] },
              status: { [Op.in]: ['Pagada', 'Completada'] }
            },
            include: [
              { 
                model: Pet,
                as: 'pet',
                attributes: ['name', 'ownerId'],
                include: [
                  { 
                    model: db.Species, 
                    as: 'species', 
                    attributes: ['name'] 
                  },
                  {
                    model: User,
                    as: 'owner',
                    attributes: ['firstName', 'lastName', 'phone', 'email']
                  }
                ]
              },
              { 
                model: Service,
                as: 'service',
                attributes: ['name', 'duration', 'price'] 
              }
            ],
            order: [['dateTime', 'ASC']]
          }),

          // Próximas citas (siguiente semana)
          Appointment.findAll({
            where: { 
              professionalId: userId,
              dateTime: { 
                [Op.between]: [todayEnd, new Date(todayEnd.getTime() + 7 * 24 * 60 * 60 * 1000)]
              },
              status: 'Pagada'
            },
            include: [
              { 
                model: Pet,
                as: 'pet',
                attributes: ['name']
              },
              { 
                model: Service,
                as: 'service',
                attributes: ['name', 'duration'] 
              }
            ],
            order: [['dateTime', 'ASC']],
            limit: 10
          }),

          // Citas completadas hoy
          Appointment.count({
            where: {
              professionalId: userId,
              dateTime: { [Op.between]: [todayStart, todayEnd] },
              status: 'Completada'
            }
          }),

          // Citas completadas esta semana
          Appointment.count({
            where: {
              professionalId: userId,
              dateTime: { [Op.gte]: lastWeekStart },
              status: 'Completada'
            }
          }),

          // Total de pacientes únicos atendidos
          sequelize.query(`
            SELECT COUNT(DISTINCT petId) as count 
            FROM Appointments 
            WHERE professionalId = :professionalId
            AND status IN ('Completada', 'Pagada')
          `, {
            replacements: { professionalId: userId },
            type: sequelize.QueryTypes.SELECT
          }),

          // Registros médicos recientes
          MedicalRecord.findAll({
            include: [
              {
                model: Appointment,
                as: 'appointment',
                where: { professionalId: userId },
                include: [
                  {
                    model: Pet,
                    as: 'pet',
                    attributes: ['name']
                  },
                  {
                    model: Service,
                    as: 'service',
                    attributes: ['name']
                  }
                ]
              }
            ],
            order: [['createdAt', 'DESC']],
            limit: 5
          }),

          // Estadísticas de citas por estado
          sequelize.query(`
            SELECT 
              status,
              COUNT(*) as count
            FROM Appointments
            WHERE professionalId = :professionalId
            AND dateTime >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY status
          `, {
            replacements: { professionalId: userId },
            type: sequelize.QueryTypes.SELECT
          })
        ]);

        data = {
          // KPIs principales
          stats: {
            totalPatients: totalPatients[0]?.count || 0,
            completedToday,
            completedThisWeek,
            todayAppointmentsCount: appointmentsToday.length,
            upcomingCount: upcomingAppointments.length
          },

          // Citas de hoy
          appointmentsToday: appointmentsToday.map(a => ({
            id: a.id,
            pet: { 
              name: a.pet.name,
              species: a.pet.species?.name || 'No especificado'
            },
            service: {
              name: a.service.name,
              duration: a.service.duration,
              price: parseFloat(a.service.price).toFixed(2)
            },
            client: {
              name: `${a.pet.owner.firstName} ${a.pet.owner.lastName}`,
              phone: a.pet.owner.phone,
              email: a.pet.owner.email
            },
            dateTime: a.dateTime,
            status: a.status
          })),

          // Próximas citas
          upcomingAppointments: upcomingAppointments.map(a => ({
            id: a.id,
            pet: {
              name: a.pet.name,
            },
            service: {
              name: a.service.name,
              duration: a.service.duration
            },
            dateTime: a.dateTime
          })),

          // Registros médicos recientes
          recentMedicalRecords: recentMedicalRecords.map(r => ({
            id: r.id,
            pet: {
              name: r.appointment.pet.name,
            },
            service: r.appointment.service.name,
            diagnosis: r.diagnosis?.substring(0, 100) || 'Sin diagnóstico',
            date: r.createdAt,
            hasTranscription: !!r.transcription
          })),

          // Distribución de citas por estado
          appointmentStats: appointmentStats.map(stat => ({
            status: stat.status,
            count: parseInt(stat.count)
          }))
        };
        break;
      }

      case 'Recepcionista': {
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        lastWeekStart.setHours(0, 0, 0, 0);

        const [
          pendingAppointmentsCount,
          todayAppointmentsCount,
          lowStockCount,
          criticalStockCount,
          pendingPaymentsCount,
          completedPaymentsToday,
          todayAppointments,
          lowStockProducts,
          pendingPaymentAppointments,
          recentSales
        ] = await Promise.all([
          // Citas pendientes (futuras y pagadas)
          Appointment.count({ 
            where: { 
              status: 'Pagada',
              dateTime: { [Op.gte]: new Date() }
            } 
          }),

          // Citas de hoy
          Appointment.count({
            where: {
              dateTime: { [Op.between]: [todayStart, todayEnd] }
            }
          }),

          // Inventario bajo
          Product.count({ where: { quantity: { [Op.lt]: 10 } } }),

          // Inventario crítico
          Product.count({ where: { quantity: { [Op.lt]: 5 } } }),

          // Pagos pendientes
          Appointment.count({ where: { status: 'Pendiente' } }),

          // Pagos completados hoy
          Appointment.count({
            where: {
              status: 'Pagada',
              dateTime: { [Op.between]: [todayStart, todayEnd] }
            }
          }),

          // Citas de hoy con detalles
          Appointment.findAll({
            where: {
              dateTime: { [Op.between]: [todayStart, todayEnd] }
            },
            include: [
              { 
                model: Pet,
                as: 'pet',
                attributes: ['name', 'ownerId'],
                include: [{
                  model: User,
                  as: 'owner',
                  attributes: ['firstName', 'lastName', 'phone']
                }]
              },
              { 
                model: Service,
                as: 'service',
                attributes: ['name', 'duration', 'price'] 
              },
              { 
                model: User,
                as: 'professional',
                attributes: ['firstName', 'lastName', 'role'] 
              }
            ],
            order: [['dateTime', 'ASC']],
            limit: 15
          }),

          // Productos con stock bajo
          Product.findAll({
            where: { quantity: { [Op.lt]: 10 } },
            attributes: ['id', 'name', 'quantity', 'price'],
            order: [['quantity', 'ASC']],
            limit: 10
          }),

          // Citas con pago pendiente
          Appointment.findAll({
            where: {
              status: 'Pendiente',
              dateTime: { [Op.lte]: new Date() }
            },
            include: [
              {
                model: Pet,
                as: 'pet',
                attributes: ['name'],
                include: [{
                  model: User,
                  as: 'owner',
                  attributes: ['firstName', 'lastName', 'phone']
                }]
              },
              {
                model: Service,
                as: 'service',
                attributes: ['name', 'price']
              }
            ],
            order: [['dateTime', 'DESC']],
            limit: 10
          }),

          // Ventas recientes (últimas 5)
          Sale.findAll({
            where: {
              createdAt: { [Op.gte]: lastWeekStart }
            },
            include: [{
              model: User,
              as: 'client',
              attributes: ['firstName', 'lastName']
            }],
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['id', 'totalAmount', 'paymentMethod', 'createdAt', 'status']
          })
        ]);

        data = {
          // KPIs principales
          stats: {
            pendingAppointmentsCount,
            todayAppointmentsCount,
            lowStockCount,
            criticalStockCount,
            pendingPaymentsCount,
            completedPaymentsToday
          },

          // Citas de hoy
          todayAppointments: todayAppointments.map(a => ({
            id: a.id,
            pet: {
              name: a.pet.name,
            },
            client: {
              name: `${a.pet.owner.firstName} ${a.pet.owner.lastName}`,
              phone: a.pet.owner.phone
            },
            service: {
              name: a.service.name,
              duration: a.service.duration,
              price: parseFloat(a.service.price).toFixed(2)
            },
            professional: {
              name: `${a.professional.firstName} ${a.professional.lastName}`,
              role: a.professional.role
            },
            dateTime: a.dateTime,
            status: a.status
          })),

          // Productos con stock bajo
          lowStockProducts: lowStockProducts.map(p => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            price: parseFloat(p.price).toFixed(2),
            isCritical: p.quantity < 5
          })),

          // Pagos pendientes
          pendingPayments: pendingPaymentAppointments.map(a => ({
            id: a.id,
            pet: a.pet.name,
            client: {
              name: `${a.pet.owner.firstName} ${a.pet.owner.lastName}`,
              phone: a.pet.owner.phone
            },
            service: a.service.name,
            amount: parseFloat(a.service.price).toFixed(2),
            date: a.dateTime
          })),

          // Ventas recientes
          recentSales: recentSales.map(s => ({
            id: s.id,
            client: s.client ? `${s.client.firstName} ${s.client.lastName}` : 'Cliente General',
            amount: parseFloat(s.totalAmount).toFixed(2),
            paymentMethod: s.paymentMethod,
            date: s.createdAt,
            status: s.status
          }))
        };
        break;
      }
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error en getDashboardData:', error);
    next(error);
  }
};