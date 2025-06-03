module.exports = (sequelize, DataTypes) => {
  const Historial = sequelize.define('Historial', {
    accion: { type: DataTypes.STRING(50), allowNull: false },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    tabla_afectada: DataTypes.STRING(40),
    descripcion: DataTypes.TEXT
  }, {
    tableName: 'historial',
    timestamps: false
  });

  return Historial;
};
