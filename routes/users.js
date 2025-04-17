const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/me', authMiddleware, userController.getCurrentUser);
router.get('/', authMiddleware, adminMiddleware, userController.getUsers);
router.get('/admin/users/:id/tasklists', authMiddleware, adminMiddleware, userController.getUserTasklistsWithTasks);
router.delete('/self', authMiddleware, userController.deleteSelf);
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);
router.patch('/:id/toggle-admin', authMiddleware, adminMiddleware, userController.toggleAdminStatus);
router.patch('/profile', authMiddleware, userController.updateSelf)

module.exports = router;
