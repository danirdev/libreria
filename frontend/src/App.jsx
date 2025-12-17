import {useState, useEffect} from 'react';
import {Users, ShoppingCart, Package, DollarSign, BarChart3, LogOut, LayoutDashboard} from 'lucide-react';

import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import Caja from './pages/Caja';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Clientes from './pages/Clientes';

function App ()
{
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState('ventas');

  // Al cargar, verificar sesión
  useEffect(() =>
  {
    const token = localStorage.getItem('token');
    const userGuardado = localStorage.getItem('usuario');

    if(token && userGuardado)
    {
      setUsuario(JSON.parse(userGuardado));
    }
  }, []);

  const loginHelper = () =>
  {
    const userGuardado = localStorage.getItem('usuario');
    if(userGuardado)
    {
      setUsuario(JSON.parse(userGuardado));
    }
  };

  const logout = () =>
  {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // Si no hay usuario, mostrar Login
  if(!usuario)
  {
    return <Login onLogin={loginHelper} />;
  }

  // Renderizar componente según página seleccionada
  const renderContent = () =>
  {
    switch(pagina)
    {
      case 'clientes': return <Clientes />;
      case 'ventas': return <Ventas />;
      case 'inventario': return <Inventario />;
      case 'caja': return <Caja />;
      case 'dashboard': return <Dashboard />;
      default: return <Ventas />;
    }
  };

  const menuItems = [
    {id: 'ventas', label: 'Ventas', icon: ShoppingCart},
    {id: 'clientes', label: 'Clientes', icon: Users},
    {id: 'inventario', label: 'Inventario', icon: Package},
    {id: 'caja', label: 'Caja', icon: DollarSign},
    {id: 'dashboard', label: 'Reportes', icon: BarChart3},
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row">

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">Librería</h1>
            <p className="text-xs text-primary-500 font-medium">POS System</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) =>
          {
            const Icon = item.icon;
            const isActive = pagina === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPagina(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary-700 font-bold shadow-sm">
              {usuario.nombre?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{usuario.nombre}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{usuario.rol || 'Vendedor'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard size={18} />
            </div>
            <span className="font-bold text-gray-800">Librería</span>
          </div>
          <div className="flex gap-2">
            {menuItems.slice(0, 3).map((item) =>
            {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setPagina(item.id)}
                  className={`p-2 rounded-lg ${pagina === item.id ? 'bg-primary-50 text-primary-600' : 'text-gray-500'}`}
                >
                  <Icon size={20} />
                </button>
              )
            })}
            <button onClick={logout} className="p-2 text-red-500"><LogOut size={20} /></button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;