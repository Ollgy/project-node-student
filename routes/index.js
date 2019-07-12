const path = require('path');
const express = require('express');
const router = express.Router();

const api = require('../api/index');

const isAuthorized = (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      return next();
    }
  } catch(err) {
    console.log(err)
  }
  res.redirect('/');
};

router.get('/api/getUsers', isAuthorized, api.getUsers);
router.get('/api/getNews', isAuthorized, api.getNews);

router.post('/api/saveNewUser', api.saveNewUser);
router.post('/api/login', api.login);
router.post('/api/authFromToken', api.authFromToken);
router.post('/api/saveUserImage/:id', isAuthorized, api.saveUserImage);
router.post('/api/newNews', isAuthorized, api.newNews);

router.put('/api/updateUser/:id', isAuthorized, api.updateUser);
router.put('/api/updateNews/:id', isAuthorized, api.updateNews);
router.put('/api/updateUserPermission/:id', isAuthorized, api.updateUserPermission);

router.delete('/api/deleteUser/:id', isAuthorized, api.deleteUser);
router.delete('/api/deleteNews/:id', isAuthorized, api.deleteNews);

router.get('/*', (req, res, next) => {
  res.sendFile(path.join(NODE_PATH + '/dist/index.html'));
});

module.exports = router;
