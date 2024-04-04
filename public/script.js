var socket = io.connect('http://localhost:2000');

// invite un utilisatuer a entrer un pseudo avant l'accès a bledroom

while(!pseudo){
    var pseudo = prompt('entrer votre nom : ');
}

// un peu de fun pour indiquer le pseudo de la personne qui connecté dansle bledroom

socket.emit('pseudo', pseudo);
document.title = pseudo + ' - ' + document.title

// Evenements : 

socket.on('newUser', (pseudo) => {
    createElementFunction('newUser', pseudo);
})

socket.on('quitUser', (pseudo) => {
    createElementFunction('quitUser', pseudo);
})

// function pour créer des elements a utiliser dans socket.io

function createElementFunction(element, content) {

    const newElement = document.createElement('div')

    switch(element) {
        case 'newUser':
            newElement.classList.add(element, 'message')
            newElement.textContent = content + ' a rejoint le bledroom';
            document.getElementById('msg').appendChild(newElement);
            break;
        
        case 'quitUser':
            newElement.classList.add(element, 'message')
            newElement.textContent = content + ' a quitté le bledroom';
            document.getElementById('msg').appendChild(newElement);
            break;    
        }
}