const express = require('express');
const router = express.Router();
const tasklistController = require('../controllers/tasklistController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware,tasklistController.getTaskLists);
router.get('/:id', authMiddleware,tasklistController.getTaskListsId);
router.post('/', authMiddleware, tasklistController.addTaskList);
router.put('/:id', authMiddleware, tasklistController.updateTaskList);
router.delete('/:id', authMiddleware, tasklistController.deleteTaskList);

module.exports = router;
