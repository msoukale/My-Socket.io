const { error } = require("console");
var express = require("express");
var app = express();
var server = require ('http').createServer(app); 
var mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

mongoose.Promise = global.Promise;

// Connexion à la base de données avec async/await
async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb://localhost/Bledroom', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connecté à la base de données MongoDB');
    } catch (error) {
        console.error('Erreur de connexion à la base de données :', error);
    }
}
// Appele de la fonction pour se connecter à la base de données
connectToDatabase();

//chercher les models:

require('./models/user.model');
require('./models/room.model');
require('./models/chat.model');

 // ici on appelle nos models créer précédement dans les modele.js
 var user = mongoose.model('user');
 var room = mongoose.model('room');
 var chat = mongoose.model('chat');


 // Rooter :
app.use(express.static(__dirname + '/public'));

app.get('/', (req,res) => {
    res.render('index.ejs');
}); 

app.use((req, res, next) => {
    res.setHeader('content-type' , 'text/html');
    res.status('page introuvable');
});

// initialisation du socket :  

var io = require('socket.io')(server);

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
            }

            const messages = await chat.find().exec();
            socket.emit('oldMessages', messages);

            // chat.find((err, messages) => {
            //     socket.emit('oldMessages', messages);
            // })


            // socket.on('getMessages', async () => {
            //     try {
            //         // Utilisation de la méthode find() avec les promesses
            //         const messages = await chat.find().exec();

            //         // Émettre les messages à l'utilisateur qui les demande
            //         socket.emit('oldMessages', messages);
            //     } catch (error) {
            //         console.error('Erreur lors de la récupération des messages :', error);
            //     }
            // });

        }
    findOrCreateUser(pseudo);
    });



    socket.on('newMessage', async (message) => {
            const newChat = new chat({
                content: message,
                sender: socket.pseudo
            });
            await newChat.save();
            socket.broadcast.emit('newMessageAll', { message: message, pseudo: socket.pseudo });
    });


    socket.on('disconnect', () => {
        socket.broadcast.emit('quitUser', socket.pseudo);
    })
})

// function d'écoute du server 
server.listen(2000, () => {
    console.log('Server MyIRC1 2000')
})