'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
    queryInterface.dropTable('UserLogin')
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
    queryInterface.createTable('UserLogin', {
      name: {
        type: Sequelize.STRING(50),
        primaryKey: true,
      },
    
      key: {
        type: Sequelize.STRING(100),
        primaryKey: true,
      },

      userId: {
        type: Sequelize.STRING,        
      }

    })
  ])
  }
};
