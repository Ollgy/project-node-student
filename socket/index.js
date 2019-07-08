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
  
    socket.emit('new user', client);
    socket.emit('all users', clients);
  
    socket.on('chat message', (message, id) => {
      console.log(message, id);
      socket.broadcast.emit('chat message', message, id);
    });
      
    socket.on('disconnect', () => {
      console.log('disconnect');
      socket.emit('delete user', id);
      delete clients[id];
    });
  });

};