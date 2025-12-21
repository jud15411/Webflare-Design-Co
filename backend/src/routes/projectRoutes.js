const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const verifyCsrf = require('../middleware/csrfProtection');

// All project routes are protected and require CSRF verification
router.use(protect);
router.use(verifyCsrf);

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.patch('/:id', projectController.updateProject);

module.exports = router;
