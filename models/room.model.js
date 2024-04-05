const mongoose = require('mongoose')

var roomSchema = new mongoose.Schema({
    name: 'string'
});

mongoose.model('room', roomSchema);