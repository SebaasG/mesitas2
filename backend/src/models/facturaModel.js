module.exports = (sequelize, DataTypes) => {
  const Factura = sequelize.define('Factura', {
    fecha_emision: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_vencimiento: { type: DataTypes.DATEONLY, allowNull: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    estado: { type: DataTypes.STRING(20), defaultValue: 'pendiente' },
    archivo_pdf: DataTypes.TEXT
  }, {
    tableName: 'facturas',
    timestamps: false
  });

  return Factura;
};
