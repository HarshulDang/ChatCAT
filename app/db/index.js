'use strict';

const config = require('../config')
const logger = require('../logger')
const Mongoose = require('mongoose').connect(config.dbURI)

//Log the error if connection fails
Mongoose.connection.on('error', error => {
    logger.log('error', 'MongoDB connection error: ' +  error);
});

//Creation fo schema
const chatUser = new Mongoose.Schema({
    profileId: String,
    fullName: String,
    profilePic: String
});

let userModel = Mongoose.model('chatUser', chatUser)

module.exports = {
    Mongoose,
    userModel
}