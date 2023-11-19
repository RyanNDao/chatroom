const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/User')

const MessageSchema = new Schema({
    content: {type: String, required: true},
    poster: {type: Schema.Types.ObjectId, ref: 'user', required: true},
    timestamp: {type: Date, required: true}
})

module.exports = mongoose.model('message', MessageSchema)