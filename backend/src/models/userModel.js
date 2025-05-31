module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    nombre: { type: DataTypes.STRING(50), allowNull: false },
    apellido: DataTypes.STRING(50),
    correo: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    telefono: DataTypes.STRING(15),
    direccion: DataTypes.TEXT,
    fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    password: { type: DataTypes.TEXT, allowNull: false }
  }, {
    tableName: 'usuarios',
    timestamps: false
  });

  return Usuario;
};
