const formidable = require('formidable');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
var Jimp = require('jimp');
const uuidv4 = require('uuid/v4');

const User = require('../models/user');
const News = require('../models/news');

// User
module.exports.saveNewUser = function(req, res) {
  const body = JSON.parse(req.body);

  const { username, password, firstName, surName, middleName, image, permission } = body;

  const newUser = new User({ 
    id: '',
    username, 
    password,
    firstName, 
    surName, 
    middleName, 
    image,
    permission: {
      chat: { id: uuidv4(), C: true, R: true, U: true, D: true },
      news: { id: uuidv4(), C: true, R: true, U: true, D: true },
      setting: { id: uuidv4(), C: true, R: true, U: true, D: true }
    },
    permissionId: '',
    access_token: 'token' 
  });

  newUser.password = newUser.setPassword(password); 

  console.log(newUser.setPassword(password));

  User.findOne({ username })
    .then(user => {
      if (user) {
        console.log('Пользователь с таким логином уже существует');
        return res.json(user);
      } else {
        newUser.save()
          .then((user) => {
            const id = user.get('_id');
            
            User.findByIdAndUpdate(id, {$set: { id, permissionId: id }}, { new: true }, (err, user) => {
              console.log("Был сохранен новый пользователь", user);

              req.logIn(user, err => {
                if (err) next(err);
                res.json(user);
              });
            });
          })
        }
      })
    .catch(function (err){
      console.log(err);
    });
};

module.exports.login = (req, res, next) => {
  const body = JSON.parse(req.body);
  req.body = body;

  passport.authenticate('local', function(err, user, info) {
    if (err) {
     return next(err);
    }
    if (!user) {
      console.log("Пользователь не зарегистрирован");
      return res.json(user);
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      if (body.remembered) {
        const token = uuidv4();
        user.setToken(token);
        user.save().then(user => {
          res.cookie('access_token', token, {
            maxAge: 7 * 60 * 60 * 1000,
            path: '/',
            httpOnly: false,
          });

          console.log("Был авторизован пользователь, установлен токен", user);
          return res.json(user);
        });
      } else {
        console.log("Был авторизован пользователь", user);
        res.json(user);
      }
    });
  })(req, res, next);
};

module.exports.authFromToken = function(req, res, next) {
  const token = req.cookies.access_token;

  if (!!token) {
    User.findOne({ access_token: token }).then(user => {
      console.log(user);
      if (user) {
        req.logIn(user, err => {
          if (err) next(err);
          res.json(user);
        });
      }
      res.sendFile(path.join(NODE_PATH + '/dist/index.html'));
    });
  } else {
    res.sendFile(path.join(NODE_PATH + '/dist/index.html'));
  }
};

module.exports.saveUserImage = function(req, res, next) {
  const { id } = req.params; 
  const form = new formidable.IncomingForm();

  const mode = process.env.NODE_ENV ? 'production' : 'development';
  
  let upload;
  upload = mode === 'development' 
    ? path.join('./dist', 'upload')
    : path.normalize('./upload');

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload);
  }

  form.uploadDir = path.join(process.cwd(), upload);

  form.parse(req, function (err, fields, files) {
    if (err) {
      fs.unlinkSync(files[id].path);
      return next(err);
    }

    const fileName = path.join(upload, files[id].name);

    fs.rename(files[id].path, fileName, function (err) {
      if (err) {
        console.error(err.message);
      }

      const dir = fileName.substr(fileName.indexOf('\\'));

      Jimp.read(fileName, (err, img) => {
        if (err) {
          console.log(err);
          return res.json('');
        }
        img
          .cover(256, 256) 
          .quality(60) 
          .write(fileName); 

          User.findByIdAndUpdate(id, { image: dir }, { new: true })
            .then((obj) => {
              console.log("Было обновлено изображение", dir);
              res.json({ path: dir });
            })
            .catch(err => {
              console.error(err);
            });
          });
        });
  });
};

module.exports.updateUser = function(req, res) {
  const body = JSON.parse(req.body);
  const { oldPassword, ...rest } = body;
  const { id } = req.params;

  User.findById(id)
    .then((obj) => {
      if (oldPassword && oldPassword !== obj.password) {
        throw new Error('Неверно указан предыдущий пароль');
      }

      User.findByIdAndUpdate(id, { ...rest }, { new: true })
        .then((obj) => {
          console.log("Были обновлены данные пользователя", obj);
          res.json(obj);
        });
    })
    .catch(function (err){
      console.log(err);
    });
}

module.exports.deleteUser = function(req, res) {
  const { id } = req.params;

  User.findByIdAndRemove(id)
    .then(user => {
      User.find((err, user) => res.json(user));
    })
    .catch(function (err){
      console.log(err);
    });
}

module.exports.getUsers = function(req, res) {
  User.find()
    .then(user => {
      res.json(user);
    })
    .catch(function (err){
      console.log(err);
    });
}

// News
module.exports.newNews = async function(req, res) {
  const body = JSON.parse(req.body);
  console.log(body);

  const { userId, date, text, theme } = body;
  const user = await User.findById(userId);

  const newsItem = new News({ 
    id: '',
    user,
    date,
    text,
    theme
  });

  newsItem.save()
    .then((obj) => {
      const id = obj.get('_id');
      
      News.findByIdAndUpdate(id, {$set: { id }}, { new: true }, (err, doc) => {
        if (err) {
          console.log(err);
        }
        console.log("Была добавлена новость", doc);
        News.find((err, obj) => res.json(obj));
      });
    })
    .catch(function (err){
      console.log(err);
    });
};

module.exports.getNews = function(req, res) {
  News.find()
    .then((obj) => {
      res.json(obj)
    })
    .catch(function (err){
      console.log(err);
    });
}

module.exports.updateNews = function(req, res) {
  const body = JSON.parse(req.body);
  const { userId, ...rest } = body;
  const { id } = req.params;

  User.findById(userId)
    .then((obj) => {
      News.findByIdAndUpdate(id, { user: obj, ...rest }, { new: true })
        .then((obj) => {
          console.log("Были обновлены новости", obj);
          News.find((err, obj) => res.json(obj));
        });
    })
    .catch(function (err){
      console.log(err);
    });
}

module.exports.deleteNews = function(req, res) {
  const { id } = req.params;

  News.findByIdAndRemove(id)
    .then((obj) => {
      News.find((err, obj) => res.json(obj));
    })
    .catch(function (err){
      console.log(err);
    });
}

module.exports.updateUserPermission = function(req, res) {
  const body = JSON.parse(req.body);

  const { permissionId, permission } = body;
  const { chat, news, setting } = permission;
  const { id: idChat, ...chatUpdate } = chat || {};
  const { id: idNews, ...newsUpdate } = news || {};
  const { id: idSetting, ...settingUpdate } = setting || {};
  const { id } = req.params;

  User.findById(id)
    .then((user) => {
      User.findByIdAndUpdate(id, { 
        permissionId, permission: { 
          chat: chatUpdate ? { ...user.permission.chat, ...chatUpdate } : { ...user.permission.chat },
          news: newsUpdate ? { ...user.permission.news, ...newsUpdate } : {...user.permission.news }, 
          setting: settingUpdate ? { ...user.permission.setting, ...settingUpdate } : { ...user.permission.setting }
      }}, { new: true })
        .then((user) => {
          console.log(`Были обновлены разрешения пользователя ${id} ${user.username}`, user.permission);
          res.json(user);
        });
    })
    .catch(function (err){
      console.log(err);
    });
}