'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('ThreadItems', 'type', {
        type: Sequelize.ENUM('message', 'inquiry', 'preApproved', 'declined', 'approved', 'pending', 'cancelledByHost', 'cancelledByGuest', 'intantBooking', 'requestToBook', 'confirmed', 'expired', 'completed', 'claimRequested', 'claimRefunded'),
        defaultValue: 'message',
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('ThreadItems', 'type', {
        type: Sequelize.ENUM('message', 'inquiry', 'preApproved', 'declined', 'approved', 'pending', 'cancelledByHost', 'cancelledByGuest', 'intantBooking', 'requestToBook', 'confirmed', 'expired', 'completed'),
        defaultValue: 'message',
      })
    ])
  }
};
