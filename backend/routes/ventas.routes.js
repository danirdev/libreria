const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. REGISTRAR VENTA (POST)
router.post('/', async (req, res) =>
{
    const client = await pool.connect();
    try
    {
        const {total, items, metodo_pago, id_cliente} = req.body;

        await client.query('BEGIN');

        // Buscar caja abierta
        const cajaRes = await client.query('SELECT id FROM caja WHERE fecha_cierre IS NULL ORDER BY id DESC LIMIT 1');
        const id_caja = cajaRes.rows.length > 0 ? cajaRes.rows[0].id : null;

        // Crear venta (AHORA GUARDAMOS ID_CLIENTE TAMBIÉN)
        const ventaRes = await client.query(
            'INSERT INTO ventas (total, metodo_pago, id_caja, id_cliente) VALUES ($1, $2, $3, $4) RETURNING id',
            [total, metodo_pago, id_caja, id_cliente || null]
        );
        const ventaId = ventaRes.rows[0].id;

        // Guardar detalles y descontar stock
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

        // Actualizar saldo cliente si es Cuenta Corriente
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
        res.status(500).send("Error al procesar venta");
    } finally
    {
        client.release();
    }
});

// 2. OBTENER HISTORIAL (GET)
router.get('/', async (req, res) =>
{
    try
    {
        // Traemos las últimas 50 ventas con el nombre del cliente (si tiene)
        // Y usamos un truco de JSON para traer los productos en la misma consulta
        const query = `
            SELECT v.id, v.fecha_hora, v.total, v.metodo_pago, c.nombre as nombre_cliente,
            (
                SELECT json_agg(json_build_object('nombre', p.nombre, 'cantidad', dv.cantidad, 'precio', dv.precio_unitario_historico))
                FROM detalle_ventas dv
                JOIN productos p ON dv.id_producto = p.id
                WHERE dv.id_venta = v.id
            ) as items
            FROM ventas v
            LEFT JOIN clientes c ON v.id_cliente = c.id
            ORDER BY v.id DESC LIMIT 50
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch(err)
    {
        console.error(err);
        res.status(500).send("Error al obtener historial");
    }
});

// 3. ANULAR VENTA (DELETE)
router.delete('/:id', async (req, res) =>
{
    const client = await pool.connect();
    try
    {
        const {id} = req.params;
        await client.query('BEGIN');

        // 1. Obtener datos de la venta antes de borrar
        const ventaRes = await client.query('SELECT * FROM ventas WHERE id = $1', [id]);
        if(ventaRes.rows.length === 0) throw new Error("Venta no encontrada");
        const venta = ventaRes.rows[0];

        // 2. Obtener items para devolver stock
        const itemsRes = await client.query('SELECT * FROM detalle_ventas WHERE id_venta = $1', [id]);

        // 3. Devolver Stock
        for(let item of itemsRes.rows)
        {
            // Verificamos si es servicio consultando el producto (opcional, o asumimos devolución siempre)
            // Para simplificar, devolvemos stock. Si era servicio infinito, sumar stock no daña nada crítico.
            await client.query('UPDATE productos SET stock_actual = stock_actual + $1 WHERE id = $2', [item.cantidad, item.id_producto]);
        }

        // 4. Devolver Saldo a Cliente (Si fue fiado)
        if(venta.metodo_pago === 'Cuenta Corriente' && venta.id_cliente)
        {
            await client.query('UPDATE clientes SET saldo_deudor = saldo_deudor - $1 WHERE id = $2', [venta.total, venta.id_cliente]);
        }

        // 5. Eliminar Venta (Cascade borrará detalles)
        await client.query('DELETE FROM ventas WHERE id = $1', [id]);

        await client.query('COMMIT');
        res.json({mensaje: "Venta anulada correctamente"});

    } catch(err)
    {
        await client.query('ROLLBACK');
        res.status(500).send(err.message);
    } finally
    {
        client.release();
    }
});

module.exports = router;