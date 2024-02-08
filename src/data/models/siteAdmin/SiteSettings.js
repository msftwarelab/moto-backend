import DataType from 'sequelize';
import Model from '../../sequelize';
import bcrypt from 'bcrypt';

const SiteSettings = Model.define('SiteSettings', {

  id: {
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  title: {
    type: DataType.STRING,
    allowNull: false,
  },

  name: {
    type: DataType.STRING,
    allowNull: false,
  },

  value: {
    type: DataType.STRING,
  },

  type: {
    type: DataType.STRING,
  }

});

export default SiteSettings;
