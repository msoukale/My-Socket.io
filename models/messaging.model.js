const mongoose = require('mongoose')

var messagingSchema = new mongoose.Schema({
    id_room: {
        type: 'string'
    },
    sender: 'string',
    receiver: 'string',
    content: 'string'
});

mongoose.model('messaging', messagingSchema);