module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {
    task_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    taskList_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    task_Title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    task_Description: {
      type: DataTypes.STRING(300),
    },
    task_Status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    task_Priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
    },
    due_Date: {
      type: DataTypes.DATE,
    },
    creation_Date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    update_Date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    owner_Id: {
      type: DataTypes.INTEGER,
    },
    color: {
      type: DataTypes.STRING(7),
    },
  }, {
    timestamps: true,
    createdAt: 'creation_Date',
    updatedAt: 'update_Date',
  });

  return Task;
};
