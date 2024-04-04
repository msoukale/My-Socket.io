var express = require("express");
var app = express();
var server = require ('http').createServer(app); 
var mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;




// Utiliser l'API de promesse globale de Node.js
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

// Appeler la fonction pour se connecter à la base de données
connectToDatabase();


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
        socket.pseudo = pseudo; // stockage de pseudo pour avoir accès dans tout le code 
        socket.broadcast.emit('newUser', pseudo)
    })

    socket.on('newMessage', (message) =>{
        socket.broadcast.emit('newMessageAll', {message: message, pseudo: socket.pseudo});
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('quitUser', socket.pseudo);
    })
})

// function d'écoute du server 
server.listen(2000, () => {
    console.log('Server MyIRC1 2000')
})