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

// --- NUEVA RUTA: OBTENER TODOS LOS PRODUCTOS ---
app.get('/productos', async (req, res) =>
{
    try
    {
        // Pedimos todo a la base de datos
        const allProducts = await pool.query('SELECT * FROM productos ORDER BY id DESC');

        // Se lo mandamos a React
        res.json(allProducts.rows);
    } catch(err)
    {
        console.error(err.message);
        res.status(500).send("Error al obtener productos");
    }
});

// --- RUTA 1: BUSCADOR INTELIGENTE ---
// Busca por código exacto O si el nombre contiene el texto
app.get('/productos/buscar/:termino', async (req, res) =>
{
    try
    {
        const {termino} = req.params;
        const query = `
      SELECT * FROM productos 
      WHERE codigo_barras = $1 
      OR nombre ILIKE $2
    `;
        const terminoNombre = `%${termino}%`;
        const results = await pool.query(query, [termino, terminoNombre]);
        res.json(results.rows);
    } catch(err)
    {
        console.error(err.message);
        res.status(500).send("Error en búsqueda");
    }
});

// --- RUTA 2: PROCESAR VENTA ---
app.post('/ventas', async (req, res) =>
{
    const client = await pool.connect();
    try
    {
        const {total, items, metodo_pago} = req.body;

        await client.query('BEGIN'); // Iniciar transacción segura

        // 1. Crear el ticket (cabecera)
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

            // Solo descontamos stock si NO es un servicio (como copias)
            if(!item.es_servicio)
            {
                await client.query(
                    'UPDATE productos SET stock_actual = stock_actual - $1 WHERE id = $2',
                    [item.cantidad, item.id]
                );
            }
        }

        await client.query('COMMIT'); // Confirmar cambios
        res.json({mensaje: "Venta exitosa", id_venta: ventaId});

    } catch(err)
    {
        await client.query('ROLLBACK'); // Cancelar todo si hay error
        console.error(err);
        res.status(500).send("Error al procesar la venta");
    } finally
    {
        client.release();
    }
});

// --- MÓDULO DE CAJA ---

// 1. CONSULTAR ESTADO (¿Está abierta o cerrada?)
app.get('/caja/estado', async (req, res) =>
{
    try
    {
        // Buscamos la última caja que NO tenga fecha de cierre
        const result = await pool.query('SELECT * FROM caja WHERE fecha_cierre IS NULL ORDER BY id DESC LIMIT 1');

        if(result.rows.length === 0)
        {
            return res.json({estado: 'CERRADA'});
        }

        const caja = result.rows[0];

        // Sumamos todas las ventas en EFECTIVO hechas desde que se abrió esta caja
        const ventasRes = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total_ventas 
      FROM ventas 
      WHERE fecha_hora >= $1 AND metodo_pago = 'Efectivo'
    `, [caja.fecha_apertura]);

        const totalVentas = parseFloat(ventasRes.rows[0].total_ventas);
        const montoInicial = parseFloat(caja.monto_inicial);

        res.json({
            estado: 'ABIERTA',
            datos: {
                id: caja.id,
                fecha_apertura: caja.fecha_apertura,
                monto_inicial: montoInicial,
                total_ventas: totalVentas,
                total_esperado: montoInicial + totalVentas // Esto es lo que debes tener en el cajón
            }
        });

    } catch(err)
    {
        console.error(err);
        res.status(500).send("Error al consultar caja");
    }
});

// 2. ABRIR CAJA (Empezar el día)
app.post('/caja/abrir', async (req, res) =>
{
    try
    {
        const {monto_inicial} = req.body;
        // Validar que no haya una ya abierta
        const check = await pool.query('SELECT * FROM caja WHERE fecha_cierre IS NULL');
        if(check.rows.length > 0) return res.status(400).json({error: "Ya hay una caja abierta"});

        await pool.query('INSERT INTO caja (monto_inicial) VALUES ($1)', [monto_inicial]);
        res.json({mensaje: "Caja abierta"});
    } catch(err)
    {
        console.error(err);
        res.status(500).send("Error al abrir caja");
    }
});

// 3. CERRAR CAJA (Fin del día)
app.post('/caja/cerrar', async (req, res) =>
{
    try
    {
        const {id_caja, monto_final_real} = req.body;

        await pool.query(`
      UPDATE caja 
      SET fecha_cierre = NOW(), 
          monto_final_real = $1, 
          estado = 'CERRADA' 
      WHERE id = $2
    `, [monto_final_real, id_caja]);

        res.json({mensaje: "Caja cerrada correctamente"});
    } catch(err)
    {
        console.error(err);
        res.status(500).send("Error al cerrar caja");
    }
});

// INICIAR EL SERVIDOR
app.listen(PORT, () =>
{
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Prueba la conexión aquí: http://localhost:${PORT}/test-db`);
});