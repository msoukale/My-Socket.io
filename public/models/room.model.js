const mongoose = require('mongoose')

var roomShema = new mongoose.Schema({
    name: string
});

mongoose.model('room', room.Schema);