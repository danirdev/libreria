import {useState, useEffect} from 'react';
import {ShoppingCart, Package, DollarSign, BarChart2, Users, LogOut, Menu, X, User} from 'lucide-react';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Caja from './pages/Caja';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Login from './pages/Login';

function App ()
{
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState('ventas');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() =>
  {
    const token = localStorage.getItem('token');
    const userGuardado = localStorage.getItem('usuario');
    if(token && userGuardado) setUsuario(JSON.parse(userGuardado));
  }, []);

  const logout = () =>
  {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  if(!usuario) return <Login onLogin={() => window.location.reload()} />;

  // Componente de Botón del Menú (Reutilizable)
  const NavLink = ({id, icon: Icon, label}) => (
    <button
      onClick={() => {setPagina(id); setSidebarOpen(false);}}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium duration-200 group
        ${pagina === id
          ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
          : 'text-gray-600 hover:bg-white hover:text-primary-600 hover:shadow-sm hover:translate-x-1'
        }`}
    >
      <Icon size={20} className={pagina === id ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'} />
      <span>{label}</span>
      {pagina === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></div>}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans overflow-hidden">

      {/* SIDEBAR (Barra Lateral) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col shadow-lg md:shadow-none md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-gray-100 bg-white">
          <div className="bg-primary-600 p-2 rounded-lg mr-3 shadow-md shadow-primary-200">
            <DollarSign className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Librería<span className="text-primary-600">POS</span></h1>
            <p className="text-xs text-gray-400 font-medium">Panel de Control</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Menú */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-2">Operaciones</p>
          <NavLink id="ventas" icon={ShoppingCart} label="Punto de Venta" />
          <NavLink id="caja" icon={DollarSign} label="Caja y Turnos" />
          <NavLink id="clientes" icon={Users} label="Clientes / Fiados" />

          <div className="my-6 border-t border-gray-100"></div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-2">Administración</p>
          <NavLink id="inventario" icon={Package} label="Inventario" />
          <NavLink id="dashboard" icon={BarChart2} label="Reportes" />
        </nav>

        {/* Usuario (Pie de página) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 m-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-primary-300 flex items-center justify-center text-white shadow-md">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 truncate">{usuario.nombre}</p>
              <p className="text-xs text-gray-500 capitalize bg-gray-200 px-2 py-0.5 rounded-full inline-block mt-0.5">{usuario.rol}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-2.5 text-sm text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-xl transition-all duration-200 font-medium">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header Móvil */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 bg-gray-100 rounded-lg active:scale-95 transition">
              <Menu size={24} />
            </button>
            <span className="font-semibold text-gray-700 capitalize text-lg">{pagina}</span>
          </div>
        </header>

        {/* Área de Trabajo (Páginas) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full bg-gray-50/50">
          <div className="max-w-7xl mx-auto h-full animate-fade-in">
            {pagina === 'ventas' && <Ventas />}
            {pagina === 'inventario' && <Inventario />}
            {pagina === 'caja' && <Caja />}
            {pagina === 'dashboard' && <Dashboard />}
            {pagina === 'clientes' && <Clientes />}
          </div>
        </div>

        {/* Fondo oscuro móvil */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 transition-opacity" onClick={() => setSidebarOpen(false)}></div>
        )}
      </main>
    </div>
  );
}

export default App;