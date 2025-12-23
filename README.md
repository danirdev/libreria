# Sistema de Gestión de Librería

Este es un sistema completo para la gestión de una librería, compuesto por un **Frontend** (interfaz de usuario) y un **Backend** (servidor y base de datos).

## 🧠 ¿Cómo funciona?

El sistema tiene dos partes principales que deben funcionar simultáneamente:

1.  **Backend (Servidor):**
    *   Escrito en **Node.js** con **Express**.
    *   Se conecta a una base de datos **PostgreSQL**.
    *   Gestiona los datos (productos, ventas, clientes) y la lógica del negocio.
    *   Funciona en el puerto `4000`.

2.  **Frontend (Cliente):**
    *   Escrito en **React** con **Vite**.
    *   Es la página web que ves y usas.
    *   Se comunica con el Backend para guardar y pedir información.
    *   Funciona en el puerto `5173`.

---

## 🛠️ Requisitos Previos

Para ejecutar este sistema en cualquier computadora, necesitas tener instalado:

1.  **Node.js**: [Descargar aquí](https://nodejs.org/). (Se recomienda la versión LTS).
2.  **PostgreSQL**: [Descargar aquí](https://www.postgresql.org/).
3.  **Git** (Opcional, si vas a clonar el repositorio).

---

## 🚀 Instalación

Sigue estos pasos para configurar el proyecto por primera vez.

### 1. Configurar la Base de Datos
1.  Abre **pgAdmin** (o tu cliente SQL preferido).
2.  Crea una nueva base de datos llamada `libreria_db` (o el nombre que prefieras).
3.  Ejecuta el script `database.sql` que se encuentra en la carpeta raíz del proyecto para crear las tablas necesarias.

### 2. Configurar el Backend
1.  Abre una terminal y entra a la carpeta `backend`:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo llamado `.env` dentro de la carpeta `backend` y configura tus datos de acceso (basándote en el archivo de ejemplo si existe, o usando este formato):
    ```env
    PORT=4000
    DB_USER=postgres
    DB_PASSWORD=tu_contraseña
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=libreria_db
    JWT_SECRET=tu_secreto_seguro
    ```
    *(Asegúrate de poner TU contraseña real de PostgreSQL)*.

### 3. Configurar el Frontend
1.  Abre una nueva terminal y entra a la carpeta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

---

## ▶️ Cómo Ejecutar el Sistema

Necesitas tener **dos terminales** abiertas al mismo tiempo.

**Terminal 1 (Backend):**
```bash
cd backend
node index.js
```
*Deberías ver: "Servidor corriendo en puerto 4000 🚀"*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*Deberías ver que Vite inicia y te muestra una URL local.*

---

## 🌐 Cómo usar desde otra computadora (Red Local)

Para acceder al sistema desde otra computadora o celular conectado a la **misma red Wi-Fi/Ethernet**:

1.  **Averigua la IP de tu servidor** (la computadora donde corre el sistema):
    *   Abre una terminal y escribe `ipconfig` (Windows).
    *   Busca la "Dirección IPv4" (ejemplo: `192.168.1.15`).

2.  **Permite la conexión (Firewall)**:
    *   Asegúrate de que Windows no esté bloqueando Node.js. Si te sale una ventana de "Alerta de seguridad de Windows", dale a "Permitir acceso" en redes privadas.

3.  **Ingresa desde el otro dispositivo**:
    *   Abre el navegador en la otra computadora.
    *   Escribe la dirección IP seguido del puerto del frontend (`5173`).
    *   Ejemplo: `http://192.168.1.15:5173`

**Nota importante**: Para que esto funcione, el archivo `vite.config.js` en el frontend ya está configurado con `host: true`. Si tienes problemas, verifica que el firewall de Windows no esté bloqueando el puerto 4000 (Backend) ni el 5173 (Frontend).