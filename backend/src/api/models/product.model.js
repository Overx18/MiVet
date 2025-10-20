//Modelo para Productos (Inventario)
// backend/src/api/models/product.model.js
import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
  class Product extends Model {}

  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
    },
  }, {
    sequelize,
    modelName: 'Product',
  });

  return Product;
};