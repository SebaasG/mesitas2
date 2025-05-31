module.exports = (sequelize, DataTypes) => {
  const Parcela = sequelize.define('Parcela', {
    numero_parcela: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    ubicacion: DataTypes.TEXT,
    estado: { type: DataTypes.STRING(15), defaultValue: 'activo' }
  }, {
    tableName: 'parcelas',
    timestamps: false
  });

  return Parcela;
};
