var express = require('express');
var router = express.Router();
var project = require('../controller/projectController');
var authMiddleware = require('../middleware/authMiddleware');

//views
router.get('/', authMiddleware.ifLoggedIn, project.renderIndexPage);
router.get('/create', authMiddleware.ifLoggedIn, project.renderCreateProjectPage);
router.get('/:id', authMiddleware.ifLoggedIn, project.renderProjectPage);

//actions
router.put('/', authMiddleware.ifLoggedIn, project.create);
router.delete('/:id', authMiddleware.ifLoggedIn, project.deleteProject);
router.post('/:id', authMiddleware.ifLoggedIn, project.update);

module.exports = router;
