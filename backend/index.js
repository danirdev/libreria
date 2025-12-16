const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Importamos la configuración de la DB
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;

// MIDDLEWARES (Configuraciones previas)
app.use(cors()); // Permite que React se conecte
app.use(express.json()); // Permite leer datos JSON que envíe React

// Configurar carpeta para subir imágenes (la crearemos en un momento)
// Esto permitirá que si entras a http://localhost:4000/uploads/foto.jpg, la veas.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CONFIGURACIÓN DE MULTER (Para guardar imágenes)
const storage = multer.diskStorage({
    destination: (req, file, cb) =>
    {
        cb(null, 'uploads/'); // Guardar en la carpeta uploads
    },
    filename: (req, file, cb) =>
    {
        // Le ponemos un nombre único: fecha + nombre original
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({storage: storage});

// RUTAS DE PRUEBA

// 1. Ruta básica para saber si el servidor vive
app.get('/', (req, res) =>
{
    res.send('¡Hola! El servidor del Sistema de Librería está funcionando 🚀');
});

// 2. Ruta para probar la BASE DE DATOS
app.get('/test-db', async (req, res) =>
{
    try
    {
        const result = await pool.query('SELECT NOW()');
        res.json({
            mensaje: 'Conexión a PostgreSQL exitosa ✅',
            hora_servidor: result.rows[0].now
        });
    } catch(err)
    {
        console.error(err);
        res.status(500).json({error: 'Error al conectar con la base de datos ❌', detalle: err.message});
    }
});

// --- NUEVA RUTA: CREAR PRODUCTO ---
// 'imagen' es el nombre del campo que enviaremos desde el formulario
app.post('/productos', upload.single('imagen'), async (req, res) =>
{
    try
    {
        const {codigo_barras, nombre, precio_costo, precio_venta, stock_actual, categoria, es_servicio} = req.body;

        // Si subieron imagen, guardamos la ruta. Si no, dejamos null.
        // Nota: Guardamos la ruta relativa para poder accederla desde el navegador
        const imagen_url = req.file ? `http://localhost:4000/uploads/${req.file.filename}` : null;

        const query = `
      INSERT INTO productos 
      (codigo_barras, nombre, precio_costo, precio_venta, stock_actual, categoria, es_servicio, imagen_url) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;

        const values = [codigo_barras, nombre, precio_costo, precio_venta, stock_actual, categoria, es_servicio, imagen_url];

        const newProduct = await pool.query(query, values);

        res.json(newProduct.rows[0]);

    } catch(err)
    {
        console.error(err.message);
        res.status(500).send("Error al guardar producto");
    }
});

// INICIAR EL SERVIDOR
app.listen(PORT, () =>
{
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Prueba la conexión aquí: http://localhost:${PORT}/test-db`);
});