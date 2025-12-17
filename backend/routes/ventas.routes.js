const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) =>
{
    const client = await pool.connect();
    try
    {
        const {total, items, metodo_pago} = req.body;
        await client.query('BEGIN');

        const ventaRes = await client.query(
            'INSERT INTO ventas (total, metodo_pago) VALUES ($1, $2) RETURNING id',
            [total, metodo_pago || 'Efectivo']
        );
        const ventaId = ventaRes.rows[0].id;

        for(let item of items)
        {
            await client.query(
                'INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario_historico) VALUES ($1, $2, $3, $4)',
                [ventaId, item.id, item.cantidad, item.precio_venta]
            );

            if(!item.es_servicio)
            {
                await client.query(
                    'UPDATE productos SET stock_actual = stock_actual - $1 WHERE id = $2',
                    [item.cantidad, item.id]
                );
            }
        }

        await client.query('COMMIT');
        res.json({mensaje: "Venta exitosa", id_venta: ventaId});
    } catch(err)
    {
        await client.query('ROLLBACK');
        res.status(500).send("Error venta");
    } finally
    {
        client.release();
    }
});

module.exports = router;