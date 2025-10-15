module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
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
    issue: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    service_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estimated_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'delivered'),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  });

  Order.associate = (models) => {
    Order.hasOne(models.CustomCase, {
      foreignKey: 'order_id',
      as: 'custom_case',
    });
  };

  return Order;
};
