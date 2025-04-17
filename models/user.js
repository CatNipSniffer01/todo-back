module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
      user_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: [6, 50],
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      acc_CR_D: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      acc_UP_D: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    }, {
      timestamps: true,
      createdAt: 'acc_CR_D',
      updatedAt: 'acc_UP_D'
    });
  
    return User;
  };
  