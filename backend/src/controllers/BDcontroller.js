const { query } = require('../config/db');
const ExcelJS = require('exceljs');

const exportarFacturasExcel = async (req, res) => {
    try {
        const result = await query(`
           SELECT 
    f.id AS id_factura,
    tf.nombre AS tipo_factura,
    u.nombre AS nombre_usuario,
    u.apellido AS apellido_usuario,
    p.numero_parcela,
    p.ubicacion AS descripcion_parcela,
    f.fecha_pago,
    f.total,
    f.estado,
    f.archivo_pdf
FROM facturas f
JOIN usuarios u ON f.usuario_id = u.id
JOIN usuarioParcela up ON up.usuario_id = u.id
JOIN parcelas p ON up.parcela_id = p.id
JOIN TipoFactura tf ON f.tipo_id = tf.id;
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Facturas');

        worksheet.columns = [
            { header: 'ID Factura', key: 'id_factura', width: 15 },
            { header: 'Tipo Factura', key: 'tipo_factura', width: 20 },
            { header: 'Nombre Usuario', key: 'nombre_usuario', width: 20 },
            { header: 'Apellido Usuario', key: 'apellido_usuario', width: 20 },
            { header: 'Parcela', key: 'numero_parcela', width: 15 },
            { header: 'Ubicación', key: 'descripcion_parcela', width: 25 },
            { header: 'Fecha pago', key: 'fecha_pago', width: 20 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Estado', key: 'estado', width: 15 },
            { header: 'Archivo PDF', key: 'archivo_pdf', width: 40 }
        ];

        worksheet.addRows(result.rows);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=facturas.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        res.status(500).json({ error: 'Error al exportar facturas' });
    }
};

module.exports = { exportarFacturasExcel };
