// api/models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Users = require('./user')(sequelize, Sequelize);
db.TaskLists = require('./tasklist')(sequelize, Sequelize);
db.Tasks = require('./task')(sequelize, Sequelize);

db.Users.hasMany(db.TaskLists, { foreignKey: 'owner_Id', onDelete: 'CASCADE' });
db.TaskLists.belongsTo(db.Users, { foreignKey: 'owner_Id' });
db.TaskLists.hasMany(db.Tasks, { foreignKey: 'taskList_Id', as: 'tasks', onDelete: 'CASCADE' });
db.Tasks.belongsTo(db.TaskLists, { foreignKey: 'taskList_Id', as: 'tasklist' });

module.exports = db;
