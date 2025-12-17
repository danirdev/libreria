import {useState, useEffect} from 'react';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Caja from './pages/Caja';
import Dashboard from './pages/Dashboard'; // Asegúrate de importar esto
import Login from './pages/Login';         // <--- Importamos el Login
import Clientes from './pages/Clientes';

function App ()
{
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState('ventas');

  // Al cargar la página, revisamos si ya estaba logueado
  useEffect(() =>
  {
    const token = localStorage.getItem('token');
    const userGuardado = localStorage.getItem('usuario');

    if(token && userGuardado)
    {
      setUsuario(JSON.parse(userGuardado));
    }
  }, []);

  // Función para cerrar sesión
  const logout = () =>
  {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // SI NO HAY USUARIO, MOSTRAMOS LOGIN
  if(!usuario)
  {
    return <Login onLogin={() => window.location.reload()} />;
  }

  // SI HAY USUARIO, MOSTRAMOS EL SISTEMA
  return (
    <div style={{fontFamily: 'Arial, sans-serif'}}>

      {/* BARRA SUPERIOR CON SALUDO Y LOGOUT */}
      <nav style={{background: '#333', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: '20px'}}>
          <button onClick={() => setPagina('clientes')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>📒 CLIENTES</button>
          <button onClick={() => setPagina('ventas')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>🛒 VENTAS</button>
          <button onClick={() => setPagina('inventario')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>📦 INVENTARIO</button>
          <button onClick={() => setPagina('caja')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>💰 CAJA</button>
          <button onClick={() => setPagina('dashboard')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>📊 REPORTES</button>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <span style={{color: '#aaa'}}>Hola, {usuario.nombre} ({usuario.rol})</span>
          <button onClick={logout} style={{background: '#d9534f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
            Salir
          </button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div style={{marginTop: '20px'}}>
        {pagina === 'clientes' && <Clientes />}
        {pagina === 'ventas' && <Ventas />}
        {pagina === 'inventario' && <Inventario />}
        {pagina === 'caja' && <Caja />}
        {pagina === 'dashboard' && <Dashboard />}
      </div>
    </div>
  );
}

export default App;