const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CodeSchema = new Schema({
    admin: {type: String, required: true},
    member: {type: String, required: true},
})

module.exports = mongoose.model('codes', CodeSchema);