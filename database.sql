-- =============================================
-- BASE DE DATOS LIBRERÍA POS - COPIA MAESTRA
-- =============================================

-- 1. TABLA USUARIOS (Login y Roles)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'vendedor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA CLIENTES (Cuenta Corriente / Fiados)
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(50),
    saldo_deudor NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA PRODUCTOS (Inventario)
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    precio_costo NUMERIC(10, 2),
    precio_venta NUMERIC(10, 2) NOT NULL,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,    -- Columna existente (útil a futuro)
    es_servicio BOOLEAN DEFAULT FALSE, -- TRUE para copias/servicios
    imagen_url VARCHAR(255),
    categoria VARCHAR(50)
);

-- 4. TABLA CAJA (Control de turnos)
CREATE TABLE IF NOT EXISTS caja (
    id SERIAL PRIMARY KEY,
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP,
    monto_inicial NUMERIC(10, 2) NOT NULL,
    monto_final_esperado NUMERIC(10, 2), -- Columna para auditoría
    monto_final_real NUMERIC(10, 2),     -- Lo que contó el cajero
    diferencia NUMERIC(10, 2),           -- Sobrante o Faltante
    estado VARCHAR(20) DEFAULT 'ABIERTA'
);

-- 5. TABLA VENTAS (Cabecera del ticket)
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
    id_caja INTEGER REFERENCES caja(id)
);

-- 6. TABLA DETALLE_VENTAS (Renglones del ticket)
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id SERIAL PRIMARY KEY,
    id_venta INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    id_producto INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario_historico NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario_historico) STORED
);

-- 7. MOVIMIENTOS DE CAJA (Gastos/Retiros manuales)
CREATE TABLE IF NOT EXISTS movimientos_caja (
    id SERIAL PRIMARY KEY,
    id_caja INTEGER REFERENCES caja(id),
    tipo VARCHAR(20), -- 'INGRESO' o 'EGRESO'
    descripcion VARCHAR(255),
    monto NUMERIC(10, 2) NOT NULL,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. DATOS INICIALES (Usuario Administrador por defecto)
-- Email: admin@libreria.com | Pass: admin123
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador', 'admin@libreria.com', '$2a$10$X7V.jX.J.X.X.X.X.X.X.uX.X.X.X.X.X.X.X.X.X.X', 'admin')
ON CONFLICT (email) DO NOTHING;