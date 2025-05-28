module.exports = (sequelize, DataTypes) => {
  const PagoUsuario = sequelize.define('PagoUsuario', {
    fecha_pago: { type: DataTypes.DATEONLY, allowNull: false },
    monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    metodo_pago: DataTypes.STRING(30),
    observaciones: DataTypes.TEXT
  }, {
    tableName: 'pagousuario',
    timestamps: false
  });

  return PagoUsuario;
};
