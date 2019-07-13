const path = require('path');
const express = require('express');
const router = express.Router();

const api = require('../api/index');

const checkAccess = (req, res, next, permissionParams) => {
  const params = permissionParams || {};
  const { block, activity } = params;

  try {
    if (req.isAuthenticated()) {
      if (!permissionParams || (permissionParams && req.user.permission[block][activity])) {
        next();
      } else {
        res.status(403).json({ success: false, message: 'No access' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Not authorized' })
    }
  } catch(err) {
    console.log(err)
  }
};

router.get('/api/getUsers', 
  (req, res, next) => { checkAccess(req, res, next, { block: 'setting', activity: 'R' }) },
  api.getUsers);

router.get('/api/getNews', 
  (req, res, next) => { checkAccess(req, res, next, { block: 'news', activity: 'R' }) }, 
  api.getNews);

router.post('/api/saveNewUser', api.saveNewUser);
router.post('/api/login', api.login);
router.post('/api/authFromToken', api.authFromToken);
router.post('/api/saveUserImage/:id', checkAccess, api.saveUserImage);

router.post('/api/newNews', 
  (req, res, next) => { checkAccess(req, res, next, { block: 'news', activity: 'C' }) },
  api.newNews);

router.put('/api/updateUser/:id', checkAccess, api.updateUser);

router.put('/api/updateNews/:id', 
  (req, res, next) => { checkAccess(req, res, next, { block: 'news', activity: 'U' }) },
  api.updateNews);

router.put('/api/updateUserPermission/:id', 
  (req, res, next) => { checkAccess(req, res, next, { block: 'setting', activity: 'U' }) },
  api.updateUserPermission);

router.delete('/api/deleteUser/:id', 
  (req, res, next) => { checkAccess(req, res, next, { block: 'setting', activity: 'D' }) }, 
  api.deleteUser);

router.delete('/api/deleteNews/:id', 
  (req, res, next) => { checkAccess(req, res, next, { block: 'news', activity: 'D' }) },
  api.deleteNews);

router.get('/*', (req, res, next) => {
  res.sendFile(path.join(NODE_PATH + '/dist/index.html'));
});

module.exports = router;
