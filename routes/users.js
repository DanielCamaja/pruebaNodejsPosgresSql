const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const usersController = require('../controllers/usersController');

router.get('/', authenticateToken, usersController.listUsers);
router.post('/', authenticateToken, usersController.createUser);
router.put('/:id', authenticateToken, usersController.updateUser);
router.delete('/:id', authenticateToken, usersController.deleteUser);

module.exports = router;
