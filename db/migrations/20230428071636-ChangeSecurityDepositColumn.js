'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('ListingData', 'securityDeposit', {
        type: Sequelize.DOUBLE,
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
