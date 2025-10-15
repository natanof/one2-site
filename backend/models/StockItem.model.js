module.exports = (sequelize, DataTypes) => {
  const StockItem = sequelize.define('StockItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    category: {
      type: DataTypes.ENUM(
        'phone_case',
        'screen_protector',
        'charger',
        'cable',
        'adapter',
        'other'
      ),
      defaultValue: 'other',
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
  }, {
    tableName: 'stock_items',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (stockItem) => {
        if (!stockItem.sku) {
          const prefix = stockItem.category 
            ? stockItem.category.substring(0, 3).toUpperCase() 
            : 'ITM';
          const random = Math.floor(1000 + Math.random() * 9000);
          stockItem.sku = `${prefix}-${random}`;
        }
      },
    },
  });

  return StockItem;
};
