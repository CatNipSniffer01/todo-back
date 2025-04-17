// api/controllers/userController.js
const db = require('../models');
const User = db.Users;
const Task = db.Tasks;
const TaskList = db.TaskLists;

const bcrypt = require('bcrypt');

require('dotenv').config();
// this is needed so backend actually checks who the root admin is

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err.message });
  }
};

exports.getCurrentUser = async (req,res)=>{
  try{
    const user = await db.Users.findByPk(req.user.id);
    if(!user){
      return res.status(404).json({ message: 'User not found within database' });
    }
    res.json({
      user_Id:user.user_Id,
      userName:user.userName,
      email:user.email,
      acc_CR_D:user.acc_CR_D,
      acc_UP_D:user.acc_UP_D,
      isAdmin:user.isAdmin,
      isEmailVerified:user.isEmailVerified
    })
  }catch(err){
    console.error('Could not refresh user',err);
    return res.status(500).json({ message: 'Could not load user profile', error: err.message });
  }
}

exports.getUserTasklistsWithTasks = async (req, res) => {
  try {
    const requestedId = parseInt(req.params.id);
    const requester = req.user;

    const rootEmail = (process.env.EMAIL_USER || '').trim().toLowerCase();

    // Fetch the user being inspected
    const targetUser = await db.Users.findByPk(requestedId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Disallow inspecting the root admin
    if (targetUser.email.trim().toLowerCase() === rootEmail) {
      return res.status(403).json({ message: 'Cannot inspect root admin' });
    }

    // Allow only admins (root or not) to inspect other users
    if (!requester.isAdmin) {
      return res.status(403).json({ message: 'Only admins may inspect users' });
    }

    // Include tasks in each tasklist
    const tasklists = await db.TaskLists.findAll({
      where: { owner_Id: requestedId },
      include: [{ model: db.Tasks, as: 'tasks' }]
    });

    res.json(tasklists);
  } catch (err) {
    console.error('Failed to retrieve tasklists:', err);
    res.status(500).json({ message: 'Could not load user tasklists', error: err.message });
  }
};




exports.deleteUser = async (req, res) => {
  try {
    const requester = req.user;
    const id = parseInt(req.params.id);
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // No one can delete themselves
    if (requester.id === id) {
      return res.status(403).json({ message: 'You cannot delete your own account from here.' });
    }

    // No one can delete root admin
    if ((user.email || '').trim().toLowerCase() === (process.env.EMAIL_USER || '').trim().toLowerCase()) {
      return res.status(403).json({ message: 'Cannot delete the root admin user.' });
    }

    // Only root admin can delete users
    if ((requester.email || '').trim().toLowerCase() !== (process.env.EMAIL_USER || '').trim().toLowerCase()) {
      return res.status(403).json({ message: 'Only the root admin can delete users.' });
    }

    await User.destroy({ where: { user_Id: id } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};



exports.deleteSelf = async (req, res) => {
  try {
    const user = req.user;

    // Admins cannot delete themselves
    if (
      user.isAdmin ||
      (user.email || '').trim().toLowerCase() === (process.env.EMAIL_USER || '').trim().toLowerCase()
    ) {
      return res.status(403).json({ message: 'Admins cannot delete their own account, contact a Root-Admin first.' });
    }

    await User.destroy({ where: { user_Id: user.id } });

    res.json({ message: 'Your account has been deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting your account', error: err.message });
  }
};



exports.toggleAdminStatus = async (req, res) => {
  try {
    const requester = req.user;
    const targetId = parseInt(req.params.id);
    const user = await User.findByPk(targetId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only root admin may promote/demote
    if ((requester.email || '').trim().toLowerCase() !== (process.env.EMAIL_USER || '').trim().toLowerCase()) {
      return res.status(403).json({ message: 'Only the root admin can promote or demote users.' });
    }

    // No one can demote themselves
    if (targetId === requester.id) {
      return res.status(403).json({ message: 'You cannot change your own admin status.' });
    }

    // No one can modify the root admin
    if ((user.email || '').trim().toLowerCase() === (process.env.EMAIL_USER || '').trim().toLowerCase()) {
      return res.status(403).json({ message: 'You cannot modify the root admin.' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({
      message: `User ${user.userName} is now ${user.isAdmin ? 'an admin' : 'a regular user'}`,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling admin status', error: err.message });
  }
};




exports.updateSelf = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userName, email, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Trimmed versions for clean comparison and no headache
    const newUserName = (userName || '').trim();
    const newEmail = (email || '').trim();

    const noUsernameChange = newUserName === user.userName;
    const noEmailChange = newEmail === user.email;
    const noPasswordChange = password ? await bcrypt.compare(password, user.password) : true;

    // Final correct no-change check
    if (noUsernameChange && noEmailChange && noPasswordChange) {
      return res.status(400).json({ message: 'No changes detected' });
    }

    // Check for duplicate username
    if (!noUsernameChange) {
      const existingUser = await User.findOne({ where: { userName: newUserName } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already in use' });
      }
      user.userName = newUserName;
    }

    // Check for duplicate email
    if (!noEmailChange) {
      const existingUser = await User.findOne({ where: { email: newEmail } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = newEmail;
    }

    // Update password if it's valid and changed
    if (password && !noPasswordChange) {
      user.password = await bcrypt.hash(password, 10);
    }

    user.acc_UP_D = new Date();
    await user.save();

    res.json({
      message: 'Account updated successfully',
      user: {
        user_Id: user.user_Id,
        userName: user.userName,
        email: user.email,
        acc_CR_D: user.acc_CR_D,
        acc_UP_D: user.acc_UP_D,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Failed to update account', error: err.message });
  }
};