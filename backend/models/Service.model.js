module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    estimated_time: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false,
      defaultValue: 60,
    },
    category: {
      type: DataTypes.ENUM(
        'repair',
        'maintenance',
        'diagnostic',
        'customization',
        'other'
      ),
      defaultValue: 'repair',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    requires_device: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'services',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        type: 'FULLTEXT',
        fields: ['name', 'description'],
      },
    ],
  });

  return Service;
};
