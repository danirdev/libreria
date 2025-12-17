const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// RUTAS (Aquí importamos lo que acabamos de separar)
app.use('/productos', require('./routes/productos.routes'));
app.use('/ventas', require('./routes/ventas.routes'));
app.use('/caja', require('./routes/caja.routes'));

// TEST
app.get('/test-db', async (req, res) =>
{
    const result = await pool.query('SELECT NOW()');
    res.json({mensaje: 'Conectado', hora: result.rows[0].now});
});

app.listen(PORT, () =>
{
    console.log(`Servidor corriendo en puerto ${PORT} 🚀`);
});