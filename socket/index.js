const io = require('socket.io');
const uuidv4 = require('uuid/v4');

module.exports = function(server) {
  const io = require('socket.io').listen(server);
  const clients = {};
  
  io.on('connection', socket => {
    const id = uuidv4();
    const client = {
      id: socket.id,
      username: socket.handshake.headers.username
    };
  
    clients[id] = client;
  
    console.log(clients);
  
    socket.broadcast.emit('new user', client);
    socket.emit('all users', clients);
  
    socket.on('chat message', (message, idReceive) => {
      console.log(message, id);
      const socket = io.sockets.clients().sockets[idReceive];
      console.log(socket);
      socket.emit('chat message', message, clients[id].id);
    });
      
    socket.on('disconnect', () => {
      console.log('disconnect');
      socket.broadcast.emit('delete user', id);
      delete clients[id];
    });
  });

};