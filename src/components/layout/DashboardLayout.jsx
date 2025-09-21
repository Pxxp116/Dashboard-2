import React from 'react';
import {
  Home,
  Calendar,
  Users,
  Menu,
  Settings,
  Building,
  Clock,
  ShoppingBag,
  Coffee,
  Bell,
  Search,
  User,
  CheckCircle,
  ChevronRight,
  QrCode
} from 'lucide-react';

const DashboardLayout = ({
  children,
  activeTab,
  onTabChange,
  features
}) => {
  const navigationItems = [
    { id: 'inicio', icon: Home, label: 'Dashboard', feature: null },
    { id: 'info', icon: Building, label: 'Información', feature: null },
    { id: 'horarios', icon: Clock, label: 'Horarios', feature: null },
    { id: 'reservas', icon: Calendar, label: 'Reservas', feature: 'RESERVATIONS' },
    { id: 'pedidos', icon: ShoppingBag, label: 'Pedidos', feature: null },
    { id: 'mesas', icon: Users, label: 'Mesas', feature: 'TABLES' },
    { id: 'splitqr', icon: QrCode, label: 'SplitQR', feature: null },
    { id: 'menu', icon: Menu, label: 'Menú', feature: 'MENU' },
    { id: 'politicas', icon: Settings, label: 'Políticas', feature: 'POLICIES' }
  ].filter(item => !item.feature || features[item.feature]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 glass-card-lg border-r border-white/20 z-40">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-theme-gradient flex-center shadow-lg">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-poppins text-slate-900">
                  GastroBot
                </h1>
                <p className="text-sm text-slate-600 font-medium">Dashboard Pro</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-4">
              Navegación
            </div>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-theme-gradient text-white shadow-lg scale-[1.02]'
                    : 'text-slate-700 hover:bg-white/40 hover:text-slate-900 hover:scale-[1.01]'
                }`}
              >
                <item.icon className={`w-5 h-5 ${
                  activeTab === item.id ? 'text-white' : 'text-slate-600 group-hover:text-slate-900'
                }`} />
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto text-white/80" />
                )}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-white/10">
            <div className="glass-card p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex-center">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">Administrador</p>
                  <p className="text-sm text-slate-600 truncate">admin@gastrobot.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-72">
        {/* Topbar */}
        <header className="sticky top-0 z-30 glass-card border-b border-white/20 backdrop-blur-xl">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Search and Breadcrumb */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 pr-4 py-2 w-64 glass-card rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white/20 transition-all duration-300"
                  />
                </div>

                <div className="hidden lg:flex items-center gap-2 text-sm text-slate-600">
                  <span>Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-slate-900 font-medium capitalize">{activeTab}</span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-4">
                {/* System Status */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Sistema Activo</span>
                </div>

                {/* Date */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-2 glass-card rounded-xl">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {new Date().toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Notifications */}
                <button className="relative p-3 glass-card rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* Profile Menu */}
                <button className="p-2 glass-card rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <User className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;