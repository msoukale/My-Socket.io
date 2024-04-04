var express = require("express");
var app = express();
var server = require ('http').createServer(app); 
var mongoose = require('mongoose');

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

// lorsqu'une presonne est connecté ou déconnecté 

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

// fuction d'écoute du server 
server.listen(2000, () => {
    console.log('Server MyIRC1 2000')
})