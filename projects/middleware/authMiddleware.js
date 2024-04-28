function ifLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}
function ifLoggedOut(req, res, next) {
    if (!req.session || !req.session.user) {
        next();
    } else {
        res.redirect('/home');
    }
}

module.exports = {
    ifLoggedIn,
    ifLoggedOut,
};