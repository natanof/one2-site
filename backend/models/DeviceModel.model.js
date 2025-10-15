module.exports = (sequelize, DataTypes) => {
  const DeviceModel = sequelize.define('DeviceModel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A marca do dispositivo é obrigatória',
        },
      },
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'O modelo do dispositivo é obrigatório',
        },
      },
    },
    release_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: {
          msg: 'O ano de lançamento deve ser um número inteiro',
        },
        min: {
          args: [1900],
          msg: 'O ano de lançamento deve ser maior que 1900',
        },
        max: {
          args: [new Date().getFullYear() + 2],
          msg: `O ano de lançamento não pode ser maior que ${new Date().getFullYear() + 2}`,
        },
      },
    },
    screen_size: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'O tamanho da tela deve ser maior que 0',
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'device_models',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['brand', 'model'],
        name: 'unique_brand_model',
      },
    ],
  });

  // Método de instância para obter o nome completo
  DeviceModel.prototype.getFullName = function() {
    return `${this.brand} ${this.model}`.trim();
  };

  // Método de classe para associações
  DeviceModel.associate = (models) => {
    // Associação com CommonIssue
    DeviceModel.hasMany(models.CommonIssue, {
      foreignKey: 'device_model_id',
      as: 'common_issues',
      onDelete: 'CASCADE',
    });
  };

  return DeviceModel;
};
