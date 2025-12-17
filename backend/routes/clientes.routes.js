const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. OBTENER TODOS LOS CLIENTES
router.get('/', async (req, res) =>
{
    try
    {
        const todos = await pool.query('SELECT * FROM clientes ORDER BY nombre ASC');
        res.json(todos.rows);
    } catch(err)
    {
        res.status(500).send("Error al obtener clientes");
    }
});

// 2. CREAR NUEVO CLIENTE
router.post('/', async (req, res) =>
{
    try
    {
        const {nombre, telefono} = req.body;
        const nuevo = await pool.query(
            'INSERT INTO clientes (nombre, telefono) VALUES ($1, $2) RETURNING *',
            [nombre, telefono]
        );
        res.json(nuevo.rows[0]);
    } catch(err)
    {
        res.status(500).send("Error al crear cliente");
    }
});

// 3. PAGAR DEUDA (El cliente viene a pagar lo que debe)
router.post('/pagar', async (req, res) =>
{
    try
    {
        const {id_cliente, monto} = req.body;

        // Descontamos del saldo deudor
        await pool.query(
            'UPDATE clientes SET saldo_deudor = saldo_deudor - $1 WHERE id = $2',
            [monto, id_cliente]
        );

        // Opcional: Aquí podrías registrar el ingreso en la Caja si quisieras ser estricto

        res.json({mensaje: "Pago registrado exitosamente"});
    } catch(err)
    {
        res.status(500).send("Error al registrar pago");
    }
});

module.exports = router;