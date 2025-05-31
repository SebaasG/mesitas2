module.exports = (sequelize, DataTypes) => {
  const TipoFactura = sequelize.define('TipoFactura', {
    nombre: { type: DataTypes.STRING(40), allowNull: false },
    descripcion: DataTypes.TEXT
  }, {
    tableName: 'tipofactura',
    timestamps: false
  });

  return TipoFactura;
};
