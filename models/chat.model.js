const mongoose = require('mongoose')

var chatSchema = new mongoose.Schema({
    id_room: {
        type: 'string'
    },
    sender: 'string',
    receiver: 'string',
    content: 'string'
});

mongoose.model('chat', chatSchema);