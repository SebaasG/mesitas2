const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rol = require('./rolModel')(sequelize, DataTypes);
const Usuario = require('./usuarioModel')(sequelize, DataTypes);
const Parcela = require('./parcelaModel')(sequelize, DataTypes);
const UsuarioParcela = require('./usuarioParcelaModel')(sequelize, DataTypes);
const TipoFactura = require('./tipoFacturaModel')(sequelize, DataTypes);
const Factura = require('./facturaModel')(sequelize, DataTypes);
const PagoUsuario = require('./pagoUsuarioModel')(sequelize, DataTypes);
const Historial = require('./historialModel')(sequelize, DataTypes);

// Relaciones
Usuario.belongsTo(Rol, { foreignKey: 'rol_id' });
Rol.hasMany(Usuario, { foreignKey: 'rol_id' });

Usuario.belongsToMany(Parcela, {
  through: UsuarioParcela,
  foreignKey: 'usuario_id'
});
Parcela.belongsToMany(Usuario, {
  through: UsuarioParcela,
  foreignKey: 'parcela_id'
});

Factura.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Factura.belongsTo(TipoFactura, { foreignKey: 'tipo_id' });

PagoUsuario.belongsTo(Factura, { foreignKey: 'factura_id' });

Historial.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = {
  sequelize,
  Rol,
  Usuario,
  Parcela,
  UsuarioParcela,
  TipoFactura,
  Factura,
  PagoUsuario,
  Historial
};
