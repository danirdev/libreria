import {useState} from 'react';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Caja from './pages/Caja'; // <--- IMPORTANTE

function App ()
{
  const [pagina, setPagina] = useState('ventas');

  return (
    <div style={{fontFamily: 'Arial, sans-serif'}}>
      <nav style={{background: '#333', padding: '15px', display: 'flex', gap: '20px'}}>
        <button onClick={() => setPagina('ventas')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>🛒 VENTAS</button>
        <button onClick={() => setPagina('inventario')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>📦 INVENTARIO</button>
        <button onClick={() => setPagina('caja')} style={{color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>💰 CAJA</button>
      </nav>

      {pagina === 'ventas' && <Ventas />}
      {pagina === 'inventario' && <Inventario />}
      {pagina === 'caja' && <Caja />}
    </div>
  );
}

export default App;