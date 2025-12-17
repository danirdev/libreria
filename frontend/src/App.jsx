import {useState} from 'react';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Caja from './pages/Caja';
import Dashboard from './pages/Dashboard';

function App ()
{
  const [pagina, setPagina] = useState('ventas');

  return (
    <div style={{fontFamily: 'Arial, sans-serif'}}>
      <nav style={{background: '#333', padding: '15px', display: 'flex', gap: '20px'}}>
        {/* --- BOTÓN TEMPORAL DEPURADO --- */}
        <button
          onClick={async () =>
          {
            try
            {
              console.log("Intentando conectar con el servidor...");
              const res = await fetch('http://localhost:4000/auth/registro', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  nombre: "Dueño",
                  email: "admin@libreria.com",
                  password: "admin123",
                  rol: "admin"
                })
              });

              if(!res.ok)
              {
                // Si el servidor responde error (ej: 404 o 500)
                const errorData = await res.text();
                throw new Error(`Error del Servidor (${res.status}): ${errorData}`);
              }

              const data = await res.json();
              alert('✅ ÉXITO: Usuario creado. ID: ' + data.id);

            } catch(error)
            {
              alert('❌ FALLÓ: ' + error.message);
              console.error("Detalle del error:", error);
            }
          }}
          style={{background: 'orange', color: 'black', padding: '15px', fontWeight: 'bold', cursor: 'pointer'}}
        >
          🛠️ INTENTAR CREAR ADMIN (VER ERRORES)
        </button>
        <button onClick={() => setPagina('ventas')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>🛒 VENTAS</button>
        <button onClick={() => setPagina('inventario')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>📦 INVENTARIO</button>
        <button onClick={() => setPagina('caja')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>💰 CAJA</button>
        <button onClick={() => setPagina('dashboard')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>📊 REPORTES</button>
      </nav>

      {pagina === 'ventas' && <Ventas />}
      {pagina === 'inventario' && <Inventario />}
      {pagina === 'caja' && <Caja />}
      {pagina === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default App;