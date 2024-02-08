'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('Reservation', 'securityDeposit', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      }),
      queryInterface.addColumn('Reservation', 'claimStatus', {
        type: Sequelize.ENUM('pending', 'approved', 'requested', 'fullyRefunded'),
        defaultValue: 'pending'
      }),
      queryInterface.addColumn('Reservation', 'claimAmount', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      }),
      queryInterface.addColumn('Reservation', 'claimPayout', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      }),
      queryInterface.addColumn('Reservation', 'claimRefund', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      }),
      queryInterface.addColumn('Reservation', 'claimReason', {
        type: Sequelize.STRING,
      }),
    ])
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Reservation', 'securityDeposit'),
      queryInterface.removeColumn('Reservation', 'claimStatus'),
      queryInterface.removeColumn('Reservation', 'claimAmount'),
      queryInterface.removeColumn('Reservation', 'claimPayout'),
      queryInterface.removeColumn('Reservation', 'claimRefund'),
      queryInterface.removeColumn('Reservation', 'claimReason')
    ])
  }
};
