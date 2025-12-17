const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// Configuración de Multer (Imágenes)
const storage = multer.diskStorage({
    destination: (req, file, cb) =>
    {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) =>
    {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({storage: storage});

// 1. OBTENER TODOS
router.get('/', async (req, res) =>
{
    try
    {
        const allProducts = await pool.query('SELECT * FROM productos ORDER BY id DESC');
        res.json(allProducts.rows);
    } catch(err)
    {
        res.status(500).send(err.message);
    }
});

// 2. BUSCAR
router.get('/buscar/:termino', async (req, res) =>
{
    try
    {
        const {termino} = req.params;
        const query = `SELECT * FROM productos WHERE codigo_barras = $1 OR nombre ILIKE $2`;
        const terminoNombre = `%${termino}%`;
        const results = await pool.query(query, [termino, terminoNombre]);
        res.json(results.rows);
    } catch(err)
    {
        res.status(500).send(err.message);
    }
});

// 3. CREAR NUEVO
router.post('/', upload.single('imagen'), async (req, res) =>
{
    try
    {
        const {codigo_barras, nombre, precio_costo, precio_venta, stock_actual, categoria, es_servicio} = req.body;
        const imagen_url = req.file ? `http://localhost:4000/uploads/${req.file.filename}` : null;

        const query = `
            INSERT INTO productos (codigo_barras, nombre, precio_costo, precio_venta, stock_actual, categoria, es_servicio, imagen_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

        const newProduct = await pool.query(query, [codigo_barras, nombre, precio_costo, precio_venta, stock_actual, categoria, es_servicio, imagen_url]);
        res.json(newProduct.rows[0]);
    } catch(err)
    {
        res.status(500).send(err.message);
    }
});

// 4. ACTUALIZAR PRODUCTO (PUT)
router.put('/:id', upload.single('imagen'), async (req, res) =>
{
    try
    {
        const {id} = req.params;
        const {codigo_barras, nombre, precio_costo, precio_venta, stock_actual, categoria, es_servicio} = req.body;

        // Lógica: Si suben imagen nueva, actualizamos todo. Si no, no tocamos la columna imagen_url.
        let query;
        let values;

        if(req.file)
        {
            const imagen_url = `http://localhost:4000/uploads/${req.file.filename}`;
            query = `
                UPDATE productos 
                SET codigo_barras=$1, nombre=$2, precio_costo=$3, precio_venta=$4, stock_actual=$5, categoria=$6, es_servicio=$7, imagen_url=$8
                WHERE id=$9 RETURNING *`;
            values = [codigo_barras, nombre, precio_costo, precio_venta, stock_actual, categoria, es_servicio, imagen_url, id];
        } else
        {
            query = `
                UPDATE productos 
                SET codigo_barras=$1, nombre=$2, precio_costo=$3, precio_venta=$4, stock_actual=$5, categoria=$6, es_servicio=$7
                WHERE id=$8 RETURNING *`;
            values = [codigo_barras, nombre, precio_costo, precio_venta, stock_actual, categoria, es_servicio, id];
        }

        const updated = await pool.query(query, values);
        res.json(updated.rows[0]);
    } catch(err)
    {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// 5. ELIMINAR PRODUCTO (DELETE)
router.delete('/:id', async (req, res) =>
{
    try
    {
        const {id} = req.params;
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({mensaje: "Producto eliminado"});
    } catch(err)
    {
        // El error 23503 es "Violación de llave foránea" (Postgres protege tus ventas)
        if(err.code === '23503')
        {
            res.status(400).json({error: "No se puede borrar: Este producto ya tiene ventas registradas."});
        } else
        {
            console.error(err);
            res.status(500).send("Error al eliminar");
        }
    }
});

module.exports = router;