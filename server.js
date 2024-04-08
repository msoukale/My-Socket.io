const { error } = require("console");
const { channel } = require("diagnostics_channel");
var express = require("express");
var app = express();
var server = require ('http').createServer(app); 
var mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

mongoose.Promise = global.Promise;

// Connexion à la base de données 
async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb://localhost/Bledroom', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connecté à la base de données MongoDB');
    } catch (error) {
        console.error('Erreur de connexion à la base de données :', error);
    }
}
connectToDatabase();

//chercher les models:

require('./models/user.model');
require('./models/room.model');
require('./models/messaging.model');

 // ici on appelle nos models créer précédement dans les modele.js
 var user = mongoose.model('user');
 var room = mongoose.model('room');
 var messaging = mongoose.model('messaging');


 // Rooter :
app.use(express.static(__dirname + '/public'));


app.get('/', (req, res) => {
    user.find()
        .then(async users => {
            const rooms = await room.find();
            if (rooms && rooms.length > 0) {
                res.render('index.ejs', { users: users, channels: rooms });
            } else {
                res.render('index.ejs', { channels: rooms });
            }
        })
        .catch(err => {
            // Traite les erreurs ici
            return room.find().then(rooms => {
                if (rooms && rooms.length > 0) {
                    res.render('index.ejs', { channels: rooms });
                } else {
                    res.render('index.ejs');
                }
            }).catch(roomErr => {
                console.error(roomErr);
                res.status(500).send('Erreur lors de la récupération des canaux');
            });
            console.error(err);
            res.status(500).send('Erreur lors de la récupération des utilisateurs');
        });
});


app.use((req, res, next) => {
    res.setHeader('content-type' , 'text/html');
    res.status('page introuvable');
});

// initialisation du socket :  
var io = require('socket.io')(server);
var connectedUsers = [];

// lorsqu'une presonne est connecté ou déconnecté et envoie des messages
io.on('connection', (socket) => {

    socket.on('pseudo' , (pseudo) => {
        async function findOrCreateUser(pseudo) {
            // lorsqu'un user est connecté on cherche: 
            let existingUser = await user.findOne({ pseudo }).exec();
            // si le user est dans la BD:
            if (existingUser) {
                socket.pseudo = pseudo;
                socket.broadcast.emit('newUser', pseudo);
            // sinon on le créé et le save dans la BD :      
            } else {
                const newUser = new user({ pseudo });
                await newUser.save();
                socket.pseudo = pseudo;  // stockage de pseudo pour avoir accès dans tout le code 
                socket.broadcast.emit('newUser', pseudo);  // lorsque le user est connecté on stocke son pseudo et on emmet aux autres
                socket.broadcast.emit('newUserInDb', pseudo); 
            }

            _joinRoom('TOGO')

            connectedUsers.push(socket);

            const messages = await messaging.find({ receiver: 'all'}).exec();
            socket.emit('oldMessages', messages);

        }
    findOrCreateUser(pseudo);
    });

    socket.on('oldWhisper', async (pseudo) => {
        try {
            const messages = await messaging.find({ receiver: pseudo }).exec();
            socket.emit('oldWhispers', messages);
        } catch (error) {
            console.error("Une erreur s'est produite lors de la recherche de messages:", error);
            socket.emit('oldWhispers', []); // Envoyer un tableau vide en cas d'erreur
        }
    });

    socket.on('newMessage', async (message, receiver) => {
        if(receiver === 'all') {

            const newMsg = new messaging({
                content: message,
                sender: socket.pseudo,
                receiver: 'all'
            });
            await newMsg.save();
            socket.broadcast.emit('newMessageAll', { message: message, pseudo: socket.pseudo });

        } else {

            try {
                const findUser = await user.findOne({ pseudo: receiver });
                if (!findUser) {
                    return false;
                } else {
                    socketReceiver = connectedUsers.find(socket => socket.pseudo === user.pseudo);
            
                    if (socketReceiver) {
                        socketReceiver.emit('whisper', { sender: socket.pseudo, message: message });
                    }
                    const newMsg = new messaging({
                        content: message,
                        sender: socket.pseudo,
                        receiver: receiver
                    });
                    await newMsg.save();
                }
            } catch (error) {
                console.error(error);
            }
            
        }
            
    });

    socket.on ('changeChannel', (channel) => {
        _joinRoom(channel);
    })

    socket.on('disconnect', () => {
        var index = connectedUsers.indexOf(socket);
        if(index > -1) {
            connectedUsers.splice(index, 1);
        }
        socket.broadcast.emit('quitUser', socket.pseudo);
    })

    async function _joinRoom(channelParam) {
        socket.leaveAll();
        socket.join(channelParam);
        socket.channel = channelParam;
    
        try {
            const existingRoom = await room.findOne({ name: socket.channel });
            if (!existingRoom) {
                const newRoom = new room({ name: socket.channel });
                await newRoom.save();
                socket.broadcast.emit('newChannel', socket.channel);
            }
        } catch (error) {
        }
    }
 
})


// function d'écoute du server 
server.listen(3000, () => {
    console.log('Server MyIRC 3000')
})