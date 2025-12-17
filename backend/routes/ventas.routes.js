const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) =>
{
    const client = await pool.connect();
    try
    {
        // Recibimos también el id_cliente (puede venir vacío si es venta común)
        const {total, items, metodo_pago, id_cliente} = req.body;

        await client.query('BEGIN'); // Iniciar transacción

        // 1. Crear el ticket de venta
        const ventaRes = await client.query(
            'INSERT INTO ventas (total, metodo_pago) VALUES ($1, $2) RETURNING id',
            [total, metodo_pago || 'Efectivo']
        );
        const ventaId = ventaRes.rows[0].id;

        // 2. Guardar los productos y descontar stock
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

        // 3. ¡NUEVO! Si es cuenta corriente, sumamos la deuda al cliente
        if(metodo_pago === 'Cuenta Corriente' && id_cliente)
        {
            await client.query(
                'UPDATE clientes SET saldo_deudor = saldo_deudor + $1 WHERE id = $2',
                [total, id_cliente]
            );
        }

        await client.query('COMMIT');
        res.json({mensaje: "Venta exitosa", id_venta: ventaId});

    } catch(err)
    {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send("Error al procesar la venta");
    } finally
    {
        client.release();
    }
});

module.exports = router;