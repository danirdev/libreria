import {useState, useEffect} from 'react';
import {Toaster} from 'react-hot-toast';
import {ShoppingCart, Package, DollarSign, BarChart2, Users, LogOut, Menu, X, User, Clock} from 'lucide-react';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Caja from './pages/Caja';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Historial from './pages/Historial';
import Login from './pages/Login';

function App ()
{
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState('ventas');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() =>
  {
    const token = localStorage.getItem('token');
    const userGuardado = localStorage.getItem('usuario');
    if(token && userGuardado) setUsuario(JSON.parse(userGuardado));

    // Cargar preferencia de tema
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches))
    {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else
    {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () =>
  {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if(newMode)
    {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else
    {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const logout = () =>
  {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  if(!usuario) return <Login onLogin={() => window.location.reload()} />;

  const NavLink = ({id, icon: Icon, label}) => (
    <button
      onClick={() => {setPagina(id); setSidebarOpen(false);}}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium duration-200 group
        ${pagina === id
          ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800'
          : 'text-gray-600 hover:bg-white hover:text-primary-600 hover:shadow-sm hover:translate-x-1 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary-400'
        }`}
    >
      <Icon size={20} className={pagina === id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-primary-500 dark:text-gray-500 dark:group-hover:text-primary-400'} />
      <span>{label}</span>
      {pagina === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400"></div>}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300">

      <Toaster position="bottom-right" reverseOrder={false}
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out flex flex-col shadow-lg md:shadow-none md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
          <div className="bg-primary-600 p-2 rounded-lg mr-3 shadow-md shadow-primary-200 dark:shadow-none">
            <DollarSign className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Fotocopias <span className="text-primary-600 dark:text-primary-400">RAMOS</span></h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Panel de Control</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-400 dark:text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 pl-2">Operaciones</p>
          <NavLink id="ventas" icon={ShoppingCart} label="Punto de Venta" />
          <NavLink id="historial" icon={Clock} label="Historial" />
          <NavLink id="caja" icon={DollarSign} label="Caja y Turnos" />
          <NavLink id="clientes" icon={Users} label="Clientes / Fiados" />

          <div className="my-6 border-t border-gray-100 dark:border-gray-700"></div>

          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 pl-2">Administración</p>
          <NavLink id="inventario" icon={Package} label="Inventario" />

          {/* --- SEGURIDAD: SOLO ADMIN VE ESTO --- */}
          {usuario?.rol === 'admin' && (
            <NavLink id="dashboard" icon={BarChart2} label="Reportes" />
          )}

        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 m-4 rounded-2xl transition-colors">

          {/* TOGGLE MODO OSCURO */}
          <button
            onClick={toggleTheme}
            className="w-full mb-3 flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm"
          >
            <span className="text-xs font-medium pl-1">Modo {darkMode ? 'Oscuro' : 'Claro'}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? 'bg-primary-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${darkMode ? 'translate-x-4.5' : 'translate-x-0.5'}`}></div>
            </div>
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-primary-300 flex items-center justify-center text-white shadow-md">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{usuario.nombre}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-gray-300 dark:border-gray-600">{usuario.rol}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900 border border-transparent rounded-xl transition-all duration-200 font-medium">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 bg-gray-100 rounded-lg active:scale-95 transition">
              <Menu size={24} />
            </button>
            <span className="font-semibold text-gray-700 capitalize text-lg">{pagina}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full bg-gray-50/50">
          <div className="max-w-7xl mx-auto h-full animate-fade-in">
            {pagina === 'ventas' && <Ventas />}
            {pagina === 'historial' && <Historial />}
            {pagina === 'inventario' && <Inventario />}
            {pagina === 'caja' && <Caja />}
            {/* Si un usuario 'vendedor' intenta forzar la vista, no se mostrará nada o podrías redirigir */}
            {pagina === 'dashboard' && (usuario.rol === 'admin' ? <Dashboard /> : <div className="text-center p-10 text-gray-500">Acceso Restringido 🔒</div>)}
            {pagina === 'clientes' && <Clientes />}
          </div>
        </div>

        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 transition-opacity" onClick={() => setSidebarOpen(false)}></div>
        )}
      </main>
    </div>
  );
}

export default App;