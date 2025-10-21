// backend/src/api/controllers/species.controller.js
import createError from 'http-errors';
import db from '../models/index.js';

const Species = db.Species;

// [Admin] Crear una nueva especie
export const createSpecies = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return next(createError(400, 'El nombre de la especie es obligatorio.'));
    }

    const newSpecies = await Species.create({ name, description });
    res.status(201).json(newSpecies);
  } catch (error) {
    // Manejar error de unicidad
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(createError(409, 'La especie ya existe.'));
    }
    next(error);
  }
};

// [Todos los autenticados] Obtener todas las especies
export const getAllSpecies = async (req, res, next) => {
  try {
    const species = await Species.findAll({ order: [['name', 'ASC']] });
    res.status(200).json(species);
  } catch (error) {
    next(error);
  }
};

// [Admin] Actualizar una especie
export const updateSpecies = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const species = await Species.findByPk(id);
    if (!species) {
      return next(createError(404, 'Especie no encontrada.'));
    }

    species.name = name || species.name;
    species.description = description || species.description;
    await species.save();

    res.status(200).json(species);
  } catch (error) {
    next(error);
  }
};

// [Admin] Eliminar una especie
export const deleteSpecies = async (req, res, next) => {
  try {
    const { id } = req.params;
    const species = await Species.findByPk(id);
    if (!species) {
      return next(createError(404, 'Especie no encontrada.'));
    }

    await species.destroy();
    res.status(204).send(); // 204 No Content
  } catch (error) {
    next(error);
  }
};