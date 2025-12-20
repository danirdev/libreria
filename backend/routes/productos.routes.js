const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para imágenes
const storage = multer.diskStorage({
    destination: function(req, file, cb)
    {
        const uploadPath = path.join(__dirname, '../uploads');
        if(!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, {recursive: true});
        cb(null, uploadPath);
    },
    filename: function(req, file, cb)
    {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});

// 1. OBTENER TODOS LOS PRODUCTOS
router.get('/', async (req, res) =>
{
    try
    {
        const result = await pool.query('SELECT * FROM productos ORDER BY id DESC');
        // Agregamos la URL completa de la imagen
        const productos = result.rows.map(p => ({
            ...p,
            imagen_url: p.imagen_url
                ? (p.imagen_url.startsWith('http') ? p.imagen_url : `http://localhost:4000/uploads/${p.imagen_url}`)
                : null
        }));
        res.json(productos);
    } catch(err)
    {
        console.error(err);
        res.status(500).send("Error al obtener productos");
    }
});

// 2. BUSCAR POR NOMBRE O CÓDIGO (Para el POS)
router.get('/buscar/:termino', async (req, res) =>
{
    try
    {
        const {termino} = req.params;
        const result = await pool.query(
            "SELECT * FROM productos WHERE LOWER(nombre) LIKE LOWER($1) OR codigo_barras = $2",
            [`%${termino}%`, termino]
        );
        const productos = result.rows.map(p => ({
            ...p,
            imagen_url: p.imagen_url
                ? (p.imagen_url.startsWith('http') ? p.imagen_url : `http://localhost:4000/uploads/${p.imagen_url}`)
                : null
        }));
        res.json(productos);
    } catch(err)
    {
        res.status(500).send("Error en búsqueda");
    }
});

// 3. CREAR PRODUCTO (AHORA CON STOCK MÍNIMO)
router.post('/', upload.single('imagen'), async (req, res) =>
{
    try
    {
        const {codigo_barras, nombre, precio_costo, precio_venta, stock_actual, stock_minimo, categoria, es_servicio} = req.body;
        const imagen_url = req.file ? req.file.filename : null;

        await pool.query(
            "INSERT INTO productos (codigo_barras, nombre, precio_costo, precio_venta, stock_actual, stock_minimo, categoria, es_servicio, imagen_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            [codigo_barras || null, nombre, precio_costo || 0, precio_venta, stock_actual || 0, stock_minimo || 5, categoria, es_servicio === 'true', imagen_url]
        );
        res.json({mensaje: "Producto guardado"});
    } catch(err)
    {
        console.error(err);
        res.status(500).send("Error al guardar producto");
    }
});

// 4. ACTUALIZAR PRODUCTO (AHORA CON STOCK MÍNIMO)
router.put('/:id', upload.single('imagen'), async (req, res) =>
{
    try
    {
        const {id} = req.params;
        const {codigo_barras, nombre, precio_costo, precio_venta, stock_actual, stock_minimo, categoria, es_servicio} = req.body;

        let query = "UPDATE productos SET codigo_barras=$1, nombre=$2, precio_costo=$3, precio_venta=$4, stock_actual=$5, stock_minimo=$6, categoria=$7, es_servicio=$8 WHERE id=$9";
        let values = [codigo_barras || null, nombre, precio_costo, precio_venta, stock_actual, stock_minimo || 5, categoria, es_servicio === 'true', id];

        if(req.file)
        {
            query = "UPDATE productos SET codigo_barras=$1, nombre=$2, precio_costo=$3, precio_venta=$4, stock_actual=$5, stock_minimo=$6, categoria=$7, es_servicio=$8, imagen_url=$9 WHERE id=$10";
            values = [codigo_barras || null, nombre, precio_costo, precio_venta, stock_actual, stock_minimo || 5, categoria, es_servicio === 'true', req.file.filename, id];
        }

        await pool.query(query, values);
        res.json({mensaje: "Producto actualizado"});
    } catch(err)
    {
        console.error(err);
        res.status(500).send("Error al actualizar");
    }
});

// 5. ELIMINAR PRODUCTO
router.delete('/:id', async (req, res) =>
{
    try
    {
        const {id} = req.params;
        await pool.query("DELETE FROM productos WHERE id = $1", [id]);
        res.json({mensaje: "Producto eliminado"});
    } catch(err)
    {
        res.status(500).send("No se pudo eliminar");
    }
});

module.exports = router;