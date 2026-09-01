const { StatusCodes } = require('http-status-codes')


const { Booking } = require('../models');
const { CrudRepository } = require('./crud-repository');

class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }
    async createBooking(data, transaction){

        // why we are sending the transaction
        //ans: because we want to make sure that if the booking is created successfully then only we will update the flight service otherwise we will rollback the transaction and the booking will not be created
        // what are the possible scenrios here when transaction will be rolled back ?
        // ans: if the flight service is down or if the flight service is not able to update the seats then we will rollback the transaction and the booking will not be created
        const booking = await Booking.create(data, {transaction:transaction});
        return booking;
    }
}
module.exports = BookingRepository;