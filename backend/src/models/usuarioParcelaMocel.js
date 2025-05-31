module.exports = (sequelize, DataTypes) => {
  const UsuarioParcela = sequelize.define('UsuarioParcela', {
    fecha_asignacion: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    estado: { type: DataTypes.STRING(15), defaultValue: 'activo' }
  }, {
    tableName: 'usuarioparcela',
    timestamps: false
  });

  return UsuarioParcela;
};
