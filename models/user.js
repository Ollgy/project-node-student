const mongoose = require('mongoose');
const bCrypt = require('bcryptjs');

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  id: {
    type: String
  },
  firstName: {
    type: String,
  },
  surName: {
    type: String,
  },
  middleName: {
    type: String,
  },
  image: {
    type: String
  },
  permission: {
    type: Object
  },
  permissionId: {
    type: String
  },
  access_token: {
    type: String
  }
});

schema.methods.setPassword = function(password) {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

schema.methods.validPassword = function(password) {
  return bCrypt.compareSync(password, this.password);
};

schema.methods.setProperty = function(property, value) {
  try {
    if (Object.keys(schema.obj).includes(property)) {
      this[property] = value;
    }
  } catch(err) {
    console.log(err);
  }
};

module.exports = mongoose.model("User", schema);
