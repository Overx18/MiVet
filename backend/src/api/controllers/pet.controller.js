// backend/src/api/controllers/pet.controller.js
import createError from 'http-errors';
import db from '../models/index.js';
import { Op } from 'sequelize';

const { Pet, User, Species } = db;

// [Cliente, Recepcionista] Crear una nueva mascota
export const createPet = async (req, res, next) => {
  try {
    const { name, speciesId, race, age, weight, gender, birthDate, notes, ownerId: providedOwnerId } = req.body;
    let ownerId = req.user.id; // Por defecto, el propietario es el usuario autenticado

    // Si el rol es Recepcionista, el ownerId debe venir en el body
    if (req.user.role === 'Recepcionista') {
      if (!providedOwnerId) {
        return next(createError(400, 'Se requiere especificar el propietario de la mascota.'));
      }

      const owner = await User.findOne({ where: { id: providedOwnerId, role: 'Cliente' } });
      if (!owner) {
        return next(createError(404, 'El propietario especificado no es un cliente válido.'));
      }
      ownerId = providedOwnerId;
    }

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
      ownerId,
      isActive: true,
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

    if (!pet) return next(createError(404, 'Mascota no encontrada.'));

    // El cliente solo puede editar sus propias mascotas
    if (req.user.role === 'Cliente' && pet.ownerId !== req.user.id) {
      return next(createError(403, 'No tienes permiso para editar esta mascota.'));
    }

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

    if (!pet) return next(createError(404, 'Mascota no encontrada.'));

    if (req.user.role === 'Cliente' && pet.ownerId !== req.user.id) {
      return next(createError(403, 'No tienes permiso para eliminar esta mascota.'));
    }

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
    const { page = 1, limit = 10, ownerName, petName, speciesId, race } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { isActive: true };
    const includeClause = [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'firstName', 'lastName'],
        where: {}, // Objeto where inicial para el dueño
      },
      {
        model: Species,
        as: 'species',
        attributes: ['id', 'name'],
      },
    ];

    if (petName) whereClause.name = { [Op.like]: `%${petName}%` };
    if (speciesId) whereClause.speciesId = speciesId;
    if (race) whereClause.race = { [Op.like]: `%${race}%` };

// 1. Aplicar filtro de búsqueda si ownerName NO está vacío
    if (ownerName && ownerName.trim().length > 0) { // <-- Se revisa que tenga contenido real
        includeClause[0].where = {
          [Op.or]: [
            { firstName: { [Op.like]: `%${ownerName.trim()}%` } },
            { lastName: { [Op.like]: `%${ownerName.trim()}%` } },
          ],
        };
      }
  
      // 2. Si el usuario autenticado es Cliente, sobrescribir con su ID
      if (req.user.role === 'Cliente') {
        whereClause.ownerId = req.user.id;
        // NO agregamos un filtro de nombre del dueño aquí, ya que solo debe ver las suyas.
        // Además, podemos limpiar el where de la inclusión del User para que no filtre a todos los Users,
        // ya que el filtro de ownerId ya hace el trabajo.
        includeClause[0].where = {}; 
      }

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

// [Todos los autenticados] Obtener una mascota por ID
export const getPet = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pet = await Pet.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName'] },
        { model: Species, as: 'species', attributes: ['id', 'name'] },
      ],
    });

    if (!pet) return next(createError(404, 'No se encontró ninguna mascota con ese ID.'));

    if (req.user.role === 'Cliente' && pet.ownerId !== req.user.id) {
      return next(createError(403, 'No tienes permiso para acceder a esta mascota.'));
    }

    res.status(200).json(pet);
  } catch (error) {
    next(error);
  }
};
