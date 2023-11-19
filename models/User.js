const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true},
    isAdmin: {type: Boolean, required: true, default: false},
    password: {type: String, required: true},
    validated: {type: Boolean, required: true, default: false}
})

module.exports = mongoose.model('user', UserSchema);