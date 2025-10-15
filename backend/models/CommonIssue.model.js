module.exports = (sequelize, DataTypes) => {
  const CommonIssue = sequelize.define('CommonIssue', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    issue: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A descrição do problema é obrigatória',
        },
      },
    },
    average_repair_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'O custo médio de reparo não pode ser negativo',
        },
      },
    },
    device_model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'device_models',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'common_issues',
    timestamps: true,
    underscored: true,
  });

  CommonIssue.associate = (models) => {
    CommonIssue.belongsTo(models.DeviceModel, {
      foreignKey: 'device_model_id',
      as: 'device_model',
    });
  };

  return CommonIssue;
};

// Adicionando a associação no modelo DeviceModel
module.exports.associateToDeviceModel = (models) => {
  models.DeviceModel.hasMany(models.CommonIssue, {
    foreignKey: 'device_model_id',
    as: 'common_issues',
  });
};
