const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: {
    type: String
  },
  user: {
    type: Object,
    required: true,
  },
  date: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  theme: {
    type: String,
  }
});

module.exports = mongoose.model("News", schema);