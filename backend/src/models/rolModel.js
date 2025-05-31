module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    nombre: { type: DataTypes.STRING(30), unique: true, allowNull: false },
    descripcion: DataTypes.TEXT
  }, {
    tableName: 'rol',
    timestamps: false
  });

  return Rol;
};
