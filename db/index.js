const mongoose = require('mongoose');
const config = require('./config.js');

// Use native promises
mongoose.Promise = global.Promise; // es6 promise

const connectionURL = `mongodb://${config.db.user}@${config.db.host}:${config.db.port}/${config.db.name}`;
mongoose.set('useCreateIndex', true);

mongoose.connect(connectionURL, { useNewUrlParser: true, useFindAndModify: false })
  .catch((e) => console.error(e));
  
global.db = mongoose.connection;

// Check connection
db.on('connected', () => {
  console.log(`Mongoose connection open  on ${connectionURL}`)
});

// Check for Db errors
db.on('error', (err) => console.error(err));

// Check for disconected
db.on('disconnected', () => {
  console.log('mongoose connection disconnected')
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('mongoose connection closed throw app terminatatnio');
    process.exit(0);
  });
});