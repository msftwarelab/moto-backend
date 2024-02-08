'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('ListingData', 'securityDeposit', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('ListingData', 'securityDeposit')
    ])
  }
};
