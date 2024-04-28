var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
var authMiddleware = require('../middleware/authMiddleware');

/* GET users listing. */
router.get('/', authMiddleware.ifLoggedOut, async function(req, res, next) {
  try {
    const users = await User.find();
    res.render('users', { users: users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/add', async function(req, res, next){
  
  /*
  var hashedPassword = await bcrypt.hash("test1234", 8);
  const fakeUserData = {
    name: 'Eldin',
    email: 'testko@gmail.com',
    password: hashedPassword
  };

  const user = new User(fakeUserData);
  await user.save();
  */

  res.redirect('../users');
});

module.exports = router;
