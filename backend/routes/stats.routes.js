const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. RESUMEN RAPIDO (Tarjetas de arriba)
router.get('/resumen', async (req, res) =>
{
    try
    {
        // Ventas de HOY
        const ventasHoy = await pool.query(`
            SELECT COALESCE(SUM(total), 0) as total 
            FROM ventas WHERE DATE(fecha_hora) = CURRENT_DATE
        `);

        // Ventas del MES
        const ventasMes = await pool.query(`
            SELECT COALESCE(SUM(total), 0) as total 
            FROM ventas WHERE EXTRACT(MONTH FROM fecha_hora) = EXTRACT(MONTH FROM CURRENT_DATE)
        `);

        // Cantidad de Productos Bajos de Stock
        const stockBajo = await pool.query(`
            SELECT COUNT(*) as cantidad 
            FROM productos WHERE stock_actual <= stock_minimo AND es_servicio = false
        `);

        res.json({
            hoy: ventasHoy.rows[0].total,
            mes: ventasMes.rows[0].total,
            stock_bajo: stockBajo.rows[0].cantidad
        });
    } catch(err) {res.status(500).send(err.message);}
});

// 2. TOP 5 PRODUCTOS MAS VENDIDOS
router.get('/top-productos', async (req, res) =>
{
    try
    {
        const top = await pool.query(`
            SELECT p.nombre, SUM(d.cantidad) as cantidad_total
            FROM detalle_ventas d
            JOIN productos p ON d.id_producto = p.id
            GROUP BY p.nombre
            ORDER BY cantidad_total DESC
            LIMIT 5
        `);
        res.json(top.rows);
    } catch(err) {res.status(500).send(err.message);}
});

// 3. VENTAS DE LOS ULTIMOS 7 DIAS (Para gráfico)
router.get('/ventas-semana', async (req, res) =>
{
    try
    {
        const semana = await pool.query(`
            SELECT TO_CHAR(fecha_hora, 'DD/MM') as fecha, SUM(total) as total
            FROM ventas
            WHERE fecha_hora >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY TO_CHAR(fecha_hora, 'DD/MM'), DATE(fecha_hora)
            ORDER BY DATE(fecha_hora) ASC
        `);
        res.json(semana.rows);
    } catch(err) {res.status(500).send(err.message);}
});

module.exports = router;