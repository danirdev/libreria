const express = require('express');
const router = express.Router();
const pool = require('../db');

// ESTADO
router.get('/estado', async (req, res) =>
{
    try
    {
        const result = await pool.query('SELECT * FROM caja WHERE fecha_cierre IS NULL ORDER BY id DESC LIMIT 1');
        if(result.rows.length === 0) return res.json({estado: 'CERRADA'});

        const caja = result.rows[0];
        const ventasRes = await pool.query(`
            SELECT COALESCE(SUM(total), 0) as total_ventas 
            FROM ventas WHERE fecha_hora >= $1 AND metodo_pago = 'Efectivo'`,
            [caja.fecha_apertura]
        );

        const totalVentas = parseFloat(ventasRes.rows[0].total_ventas);
        const montoInicial = parseFloat(caja.monto_inicial);

        res.json({
            estado: 'ABIERTA',
            datos: {...caja, total_ventas: totalVentas, total_esperado: montoInicial + totalVentas}
        });
    } catch(err) {res.status(500).send(err.message);}
});

// ABRIR
router.post('/abrir', async (req, res) =>
{
    try
    {
        const {monto_inicial} = req.body;
        const check = await pool.query('SELECT * FROM caja WHERE fecha_cierre IS NULL');
        if(check.rows.length > 0) return res.status(400).json({error: "Ya abierta"});

        await pool.query('INSERT INTO caja (monto_inicial) VALUES ($1)', [monto_inicial]);
        res.json({mensaje: "Abierta"});
    } catch(err) {res.status(500).send(err.message);}
});

// CERRAR
router.post('/cerrar', async (req, res) =>
{
    try
    {
        const {id_caja, monto_final_real} = req.body;
        await pool.query(`UPDATE caja SET fecha_cierre = NOW(), monto_final_real = $1, estado = 'CERRADA' WHERE id = $2`, [monto_final_real, id_caja]);
        res.json({mensaje: "Cerrada"});
    } catch(err) {res.status(500).send(err.message);}
});

module.exports = router;