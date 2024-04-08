var socket = io.connect('http://localhost:3000');

// invite un utilisatuer a entrer un pseudo avant l'accès a bledroom

while(!pseudo){
    var pseudo = prompt('entrer votre nom : ');
}
  
// un peu de fun pour indiquer le pseudo de la personne qui connecté dans le bledroom

socket.emit('pseudo', pseudo);
socket.emit('oldWhispers', pseudo);
document.title = pseudo + ' - ' + document.title

document.getElementById('chatForm').addEventListener('submit', (e) => {

    e.preventDefault();

    const textInput = document.getElementById('msgInput').value;
    document.getElementById('msgInput').value = '';

    const receiver = document.getElementById('receiverInput').value;

    if(textInput.length > 0){

        socket.emit('newMessage', textInput, receiver);
        if(receiver === 'all') {
            createElementFunction('newMessageMe', textInput);
        }

    }else{
        return false;
    }
})

// Evenements : 

socket.on('newUser', (pseudo) => {
    createElementFunction('newUser', pseudo);
})

socket.on('newUserInDb', (pseudo) => {
    newOptions = document.createElement('option');
    newOptions.textContent = pseudo;
    newOptions.value = pseudo;
    document.getElementById('receiverInput').appendChild(newOptions)
})

socket.on('oldWhisper', (messages) => {
    createElementFunction('oldWhispers', messages)
})

socket.on('newMessageAll', (content) => {
    createElementFunction('newMessageAll', content);
})

socket.on('whisper', (content) => {
    createElementFunction('whisper', content);
})

socket.on('newChannel', (newChannel) => {
    createChannel(newChannel);
})

socket.on('oldMessages', (messages) => {
    messages.forEach(message => {
        if(message.sender === pseudo) {
            createElementFunction('oldMessageMe', message);
        } else {
            createElementFunction('oldMessages', message);
        }
        
    });
})

socket.on('quitUser', (pseudo) => {
    createElementFunction('quitUser', pseudo);
})

// function pour créer des elements a utiliser dans socket.io

function createChannel(newRoom) {
    const newRoomItem = document.createElement('li');
    newRoomItem.classList.add('elementList');
    newRoomItem.id = newRoom;
    newRoomItem.textContent = newRoom;
    newRoomItem.setAttribute('onclick', "_joinRoom( '" + newRoom + "' )");
    document.getElementById('roomList').insertBefore(newRoomItem, document.getElementById('createNewRoom'));
}

function _joinRoom(channel) {
    document.getElementById('msg').innerHTML = '';
    socket.emit('changeChannel', channel);

}

function createElementFunction(element, content) {

    const newElement = document.createElement('div')

    switch(element) {
        case 'newUser':
            newElement.classList.add(element, 'message')
            newElement.textContent = content + ' a rejoint le bledroom';
            document.getElementById('msg').appendChild(newElement);
            break;

        case 'newMessageMe':
            newElement.classList.add(element,'message');
            newElement.innerHTML = pseudo + ': ' + content;
            document.getElementById('msg').appendChild(newElement);
            break;   
            
        case 'newMessageAll':
            newElement.classList.add(element,'message');
            newElement.innerHTML = content.pseudo + ': ' + content.message;
            document.getElementById('msg').appendChild(newElement);
            break;


        case 'whisper':
            newElement.classList.add('message');
            newElement.innerHTML = content.sender + 'vous a envoyé un message: ' + content.message;
            document.getElementById('msg').appendChild(newElement);
            break;


            case 'oldMessages':
            newElement.classList.add(element,'message');
            newElement.innerHTML = content.sender + ': ' + content.content;
            document.getElementById('msg').appendChild(newElement);
            break;

        case 'oldMessagesMe':
            newElement.classList.add('newMessageMe', 'message');
            newElement.innerHTML = content.sender + 'Tu as eu un message: ' + content.content;
            document.getElementById('msg').appendChild(newElement);
            break;  
          
        case 'oldWhisper':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = content.sender + ': ' + content.content;
            document.getElementById('msg').appendChild(newElement);
            break;  



        
        case 'quitUser':
            newElement.classList.add(element, 'message')
            newElement.textContent = content + ' a quitté le bledroom';
            document.getElementById('msg').appendChild(newElement);
            break;    
        }
}