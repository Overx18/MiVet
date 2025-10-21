//Lógica para CRUD de mascotas y especies
// backend/src/api/controllers/pet.controller.js
import createError from 'http-errors';
import db from '../models/index.js';
import { Op } from 'sequelize';

const Pet = db.Pet;
const User = db.User;
const Species = db.Species;

// [Cliente, Recepcionista] Crear una nueva mascota
export const createPet = async (req, res, next) => {
  try {
    const { name, speciesId, race, age, weight, gender, birthDate, notes } = req.body;
    let ownerId = req.user.id; // Por defecto, el propietario es el usuario autenticado

    // Si el rol es Recepcionista, el ownerId debe venir en el body
    if (req.user.role === 'Recepcionista') {
      if (!req.body.ownerId) {
        return next(createError(400, 'Se requiere especificar el propietario de la mascota.'));
      }
      // Validar que el ownerId corresponde a un usuario con rol 'Cliente'
      const owner = await User.findOne({ where: { id: req.body.ownerId, role: 'Cliente' } });
      if (!owner) {
        return next(createError(404, 'El propietario especificado no es un cliente válido.'));
      }
      ownerId = req.body.ownerId;
    }

    // Validaciones básicas
    if (!name || !speciesId) {
      return next(createError(400, 'El nombre y la especie son obligatorios.'));
    }

    const newPet = await Pet.create({
      name,
      speciesId,
      race,
      age,
      weight,
      gender,
      birthDate,
      notes,
      ownerId, // Asociar con el propietario
    });

    res.status(201).json(newPet);
  } catch (error) {
    next(error);
  }
};

// [Cliente, Recepcionista, Veterinario] Actualizar una mascota
export const updatePet = async (req, res, next) => {
    try {
      const { id } = req.params;
      const pet = await Pet.findByPk(id);
  
      if (!pet) {
        return next(createError(404, 'Mascota no encontrada.'));
      }
  
      // Verificación de permisos: El cliente solo puede editar sus propias mascotas
      if (req.user.role === 'Cliente' && pet.ownerId !== req.user.id) {
        return next(createError(403, 'No tienes permiso para editar esta mascota.'));
      }
  
      // Actualizar los campos proporcionados
      const { name, speciesId, race, age, weight, gender, birthDate, notes } = req.body;
      await pet.update({ name, speciesId, race, age, weight, gender, birthDate, notes });
  
      res.status(200).json(pet);
    } catch (error) {
      next(error);
    }
  };
  
  // [Cliente, Recepcionista, Veterinario] Eliminar una mascota (borrado lógico)
  export const deletePet = async (req, res, next) => {
    try {
      const { id } = req.params;
      const pet = await Pet.findByPk(id);
  
      if (!pet) {
        return next(createError(404, 'Mascota no encontrada.'));
      }
  
      // Verificación de permisos: El cliente solo puede eliminar sus propias mascotas
      if (req.user.role === 'Cliente' && pet.ownerId !== req.user.id) {
        return next(createError(403, 'No tienes permiso para eliminar esta mascota.'));
      }
  
      // Borrado lógico: marcar como inactiva
      pet.isActive = false;
      await pet.save();
  
      res.status(204).send(); // No Content
    } catch (error) {
      next(error);
    }
  };

// [Todos los autenticados] Obtener lista de mascotas con filtros, paginación y ordenamiento
export const getAllPets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ownerName, petName, speciesId, race} = req.query;
    const offset = (page - 1) * limit;

    // 1. Construir la cláusula 'where' para los filtros
    const whereClause = { }; // isActive: true Solo mostrar mascotas activas
    const includeClause = [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName'],
        where: {}, // Objeto 'where' para el modelo User
      },
      {
        model: Species,
        attributes: ['id', 'name'],
      },
    ];

        // Filtro por nombre de la mascota
    if (petName) {
      whereClause.name = { [Op.like]: `%${petName}%` };
    }
    if (speciesId) whereClause.speciesId = speciesId;
    if (race) whereClause.race = { [Op.like]: `%${race}%` };

    // Filtro por nombre del propietario (busca en nombre y apellido)
    if (ownerName) {
      includeClause[0].where = {
        [Op.or]: [
          { firstName: { [Op.like]: `%${ownerName}%` } },
          { lastName: { [Op.like]: `%${ownerName}%` } },
        ],
      };
    }

    // 2. Restricción por rol: Clientes solo ven sus propias mascotas
    if (req.user.role === 'Cliente') {
      whereClause.ownerId = req.user.id;
    }

    // 3. Realizar la consulta con paginación y asociaciones
    const { count, rows } = await Pet.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    res.status(200).json({
      status: 'success',
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      pets: rows, 
    });
  } catch (error) {
    next(error);
  }
};

export const getPet = async (req, res, next) => {
  try {
  const { id } = req.params;
  const pet = await Pet.findByPk(id, {
    include: [
      { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName'] },
      { model: Species, attributes: ['id', 'name'] },
    ],
  });

  if (!pet) {
    return next(new AppError('No se encontró ninguna mascota con ese ID.', 404));
  }

  // Lógica de autorización: El cliente solo puede ver su propia mascota
  if (req.user.role === 'Cliente' && pet.ownerId !== req.user.id) {
    return next(new AppError('No tienes permiso para acceder a esta mascota.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: pet,
  });
} catch (error) {
    next(error);
  }
};