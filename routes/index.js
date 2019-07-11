const path = require('path');
const express = require('express');
const router = express.Router();

const api = require('../api/index');

router.get('/*', (req, res, next) => {
    // if (err) {
    //   console.log(err);
    // }
  
  res.sendFile(path.join(NODE_PATH + '/dist/index.html'));
});

router.post('/api/saveNewUser', api.saveNewUser);
router.post('/api/login', api.login);
router.post('/api/authFromToken', api.authFromToken);
router.post('/api/saveUserImage/:id', api.saveUserImage);
router.put('/api/updateUser/:id', api.updateUser);
router.delete('/api/deleteUser/:id', api.deleteUser);
router.get('/api/getUsers', api.getUsers);
router.post('/api/newNews', api.newNews);
router.get('/api/getNews', api.getNews);
router.delete('/api/deleteNews/:id', api.deleteNews);
router.put('/api/updateNews/:id', api.updateNews);
router.put('/api/updateUserPermission/:id', api.updateUserPermission);

module.exports = router;
