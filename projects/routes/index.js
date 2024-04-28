var express = require('express');
var router = express.Router();
var index = require('../controller/indexController');
var authMiddleware = require('../middleware/authMiddleware');

//views
router.get('/', authMiddleware.ifLoggedOut, index.renderLoginPage);
router.get('/register', authMiddleware.ifLoggedOut, index.renderRegisterPage);
router.get('/home', authMiddleware.ifLoggedIn, index.renderHomePage);

//actions
router.post('/login', authMiddleware.ifLoggedOut, index.login);
router.post('/register', authMiddleware.ifLoggedOut, index.register);
router.post('/logout', authMiddleware.ifLoggedIn, index.logout);



module.exports = router;
