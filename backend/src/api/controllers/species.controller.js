// backend/src/api/controllers/species.controller.js
import createError from 'http-errors';
import db from '../models/index.js';

const { Species } = db;

//  [Admin] Crear una nueva especie
export const createSpecies = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validación básica
    if (!name?.trim()) {
      return next(createError(400, 'El nombre de la especie es obligatorio.'));
    }

    // Verificar si ya existe una especie con ese nombre
    const existing = await Species.findOne({ where: { name } });
    if (existing) {
      return next(createError(409, 'Ya existe una especie con ese nombre.'));
    }

    const newSpecies = await Species.create({
      name: name.trim(),
      description: description?.trim() || '',
    });

    res.status(201).json({
      message: 'Especie creada exitosamente.',
      species: newSpecies,
    });
  } catch (error) {
    next(error);
  }
};

// [Todos los autenticados] Obtener todas las especies
export const getAllSpecies = async (req, res, next) => {
  try {
    const species = await Species.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'description'],
    });

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
    if (!species) return next(createError(404, 'Especie no encontrada.'));

    // Si se cambia el nombre, verificar duplicado
    if (name && name.trim() !== species.name) {
      const duplicate = await Species.findOne({ where: { name: name.trim() } });
      if (duplicate) return next(createError(409, 'Ya existe otra especie con ese nombre.'));
    }

    await species.update(req.body);

    res.status(200).json({
      message: 'Especie actualizada exitosamente.',
      species,
    });
  } catch (error) {
    next(error);
  }
};

// [Admin] Eliminar una especie
export const deleteSpecies = async (req, res, next) => {
  try {
    const { id } = req.params;

    const species = await Species.findByPk(id);
    if (!species) return next(createError(404, 'Especie no encontrada.'));

    await species.destroy();

    res.status(200).json({
      message: `La especie "${species.name}" fue eliminada correctamente.`,
    });
  } catch (error) {
    next(error);
  }
};
