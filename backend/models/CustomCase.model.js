module.exports = (sequelize, DataTypes) => {
  const CustomCase = sequelize.define('CustomCase', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    device_model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    design_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    design_image: {
      type: DataTypes.STRING, // URL to the image
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'design_pending',
        'design_approved',
        'in_production',
        'ready_for_pickup',
        'delivered'
      ),
      defaultValue: 'design_pending',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimated_completion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    design_approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'custom_cases',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['status'],
      },
      {
        type: 'FULLTEXT',
        fields: ['customer_name', 'phone', 'device_model'],
      },
    ],
  });

  CustomCase.associate = (models) => {
    CustomCase.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order',
    });
  };

  return CustomCase;
};
