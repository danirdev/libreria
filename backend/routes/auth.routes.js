const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// CLAVE SECRETA (En un proyecto real, esto va en el .env)
const SECRET_KEY = 'mi_secreto_super_seguro';

// 1. REGISTRAR USUARIO (Solo para crear el primer admin o empleados)
router.post('/registro', async (req, res) =>
{
    try
    {
        const {nombre, email, password, rol} = req.body;

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
            [nombre, email, hashPassword, rol || 'vendedor']
        );

        res.json(newUser.rows[0]);
    } catch(err)
    {
        console.error(err);
        res.status(500).send("Error al registrar usuario");
    }
});

// 2. LOGIN (Iniciar Sesión)
router.post('/login', async (req, res) =>
{
    try
    {
        const {email, password} = req.body;

        // a) Buscar usuario
        const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if(user.rows.length === 0) return res.status(400).json({error: "Usuario no encontrado"});

        // b) Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if(!validPassword) return res.status(400).json({error: "Contraseña incorrecta"});

        // c) Crear Token (La llave de acceso)
        const token = jwt.sign(
            {id: user.rows[0].id, rol: user.rows[0].rol},
            SECRET_KEY,
            {expiresIn: '8h'} // La sesión dura 8 horas
        );

        res.json({
            mensaje: "Bienvenido",
            token,
            usuario: {nombre: user.rows[0].nombre, rol: user.rows[0].rol}
        });

    } catch(err)
    {
        console.error(err);
        res.status(500).send("Error de servidor");
    }
});

module.exports = router;