'use strict';

const {Enums} = require('../utils/common')
const { PENDING , INITIATED , BOOKED , CANCELLED} = Enums.BOOKING_STATUS
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flightId: {
        type: Sequelize.INTEGER,
        allowNull : false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull : false
      },
      status: {
        type: Sequelize.ENUM,
        allowNull : false,
        values:[ CANCELLED , BOOKED ,INITIATED ,PENDING],
        defaultValue : INITIATED,
  
      },
      noOfSeats :{// no of seats requested by user
        type: Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 1
      },
      totalCost: {
        type: Sequelize.INTEGER,
        allowNull : false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};