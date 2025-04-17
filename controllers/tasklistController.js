// api/controllers/tasklistController.js
const db = require('../models');
const TaskList = db.TaskLists;
const Task = db.Tasks;

exports.getTaskLists = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasklists = await TaskList.findAll({ where: { owner_Id: userId } });
    res.json(tasklists);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving task lists', error: err.message });
  }
};
exports.getTaskListsId = async (req, res) => {
  try{
    const requestedId = parseInt(req.params.id);
    if(requestedId !== req.user.id){
      return res.status(403).json({ message: 'You are not allowed to access this resource' });
    }

    const tasklists = await TaskList.findAll({ where: { owner_Id: requestedId } });
    res.json(tasklists);
  }
  catch(err){
    res.status(500).json({ message: 'Error retrieving task lists', error: err.message });
  }
};

exports.addTaskList = async (req, res) => {
  try {
    const { list_Title, list_Description, color } = req.body;
    const owner_Id = req.user.id;
    const tasklist = await TaskList.create({
      list_Title,
      list_Description,
      color,
      owner_Id,
      creation_Date: new Date(),
      update_Date: new Date()
    });
    res.json(tasklist);
  } catch (err) {
    res.status(500).json({ message: 'Error adding task list', error: err.message });
  }
};

exports.updateTaskList = async (req, res) => {
  try {
    const id = req.params.id;
    const { list_Title, list_Description, color } = req.body;

    const tasklist = await TaskList.findByPk(id);
    if (!tasklist) {
      return res.status(404).json({ message: 'Task list not found' });
    }
    if (tasklist.owner_Id !== req.user.id){
      return res.status(403).json({ message: 'You are not authorized to update this task list' });
    }
    tasklist.list_Title = list_Title;
    tasklist.list_Description = list_Description;
    tasklist.color = color;
    tasklist.update_Date = new Date();
    await tasklist.save();
    res.json(tasklist);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task list', error: err.message });
  }
};

exports.deleteTaskList = async (req, res) => {
  try {
    const id = req.params.id;
    const tasklist = await TaskList.findByPk(id);

    if (!tasklist) {
      return res.status(404).json({ message: 'Task list not found' });
    }

    if (tasklist.owner_Id !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this task list' });
    }

    await tasklist.destroy(); // Automatic cascade for tasks, there should no longer be any issues whatsoever
    res.json({ message: 'Task list deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task list', error: err.message });
  }
};

