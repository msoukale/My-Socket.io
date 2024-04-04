const mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    pseudo: string
});

mongoose.model('user', userSchema);