'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
    queryInterface.createTable('UserLogin', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      name: {
        type: Sequelize.STRING
      },
    
      key: {
        type: Sequelize.STRING
      },
    
      userId: {
        type: Sequelize.STRING
      },
    
      deviceType: {
        type: Sequelize.STRING
      },

      deviceId: {
        type: Sequelize.STRING
      },
    
      deviceDetail: {
        type: Sequelize.TEXT
      },

      createdAt: {
        type: Sequelize.DATE
      },

      updatedAt: {
        type: Sequelize.DATE
      }
    })
  ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
    queryInterface.dropTable('UserLogin')
    ])
  }
};
