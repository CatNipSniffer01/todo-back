module.exports = (sequelize, DataTypes) => {
  const TaskList = sequelize.define("TaskList", {
    list_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    list_Title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    list_Description: {
      type: DataTypes.STRING(200),
    },
    creation_Date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    update_Date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    color: {
      type: DataTypes.STRING(7),
    },
    owner_Id: {
      type: DataTypes.INTEGER,
    },
  }, {
    timestamps: true,
    createdAt: 'creation_Date',
    updatedAt: 'update_Date',
  });

  return TaskList;
};
