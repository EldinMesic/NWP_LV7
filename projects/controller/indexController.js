const User = require('../models/user');
const bcrypt = require('bcrypt');

function renderLoginPage(req, res, next) {
    const error = req.query.error || null;
    res.render('../views/login', {error: error});
}  
function renderRegisterPage(req, res, next) {
    const error = req.query.error || null;
    res.render('../views/register', {error: error});
}
function renderHomePage(req, res, next) {
    res.render('../views/home');
}

async function login(req, res){
    const { emailOrUsername, password } = req.body;

    try {
        let user = await User.findOne({
            $or: [{ email: emailOrUsername }, { name: emailOrUsername }]
        });

        if (!user) {
            return res.redirect('/?error=User not found');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.redirect('/?error=Incorrect password');
        }

        req.session.user = user;
        res.redirect('/home');
    } catch (error) {
        res.redirect(`/?error=${error.message}`);
    }
}
function logout(req, res){
    req.session.destroy();
    res.redirect('/');
}

async function register(req, res){
    const { name, email, password } = req.body;
  
    try {
        var existingUser = await User.findOne({ name });
        if(existingUser) {
            return res.redirect('../register?error=username already exists');
        }

        existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.redirect('../register?error=email already exists');
        }
    
        const hashedPassword = await bcrypt.hash(password, 8);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
    
        req.session.user = newUser;
        res.redirect('/home');
    } catch (error) {
        res.redirect(`../register?error=${error.message}`);
    }
}

module.exports = {
    renderLoginPage,
    renderRegisterPage,
    renderHomePage,
    login,
    register,
    logout,
};