import React, { useState, Component, ErrorInfo } from 'react';
import { MemoryRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Wallet, Settings, LifeBuoy, Menu, X, Bell, User as UserIcon, MessageSquare, AlertTriangle, LogOut, Sun, Moon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import Riders from './pages/Riders';
import Finance from './pages/Finance';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import { isAuthenticated, logout } from './services/api';
import { ThemeProvider, useTheme } from './context/ThemeContext';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// --- Error Boundary ---
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  readonly props: Readonly<ErrorBoundaryProps>;
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6 text-sm">The application encountered an unexpected error.</p>
            <div className="bg-gray-50 p-3 rounded text-left text-xs font-mono text-gray-700 overflow-auto max-h-32 mb-6 border border-gray-200">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, path, active, onClick }: any) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
      ? 'bg-indigo-600 text-white shadow-md'
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Package className="fill-indigo-600 text-white" />
            <span>LogiAdmin</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" active={isActive('/dashboard')} onClick={onClose} />
          <SidebarItem icon={Package} label="Deliveries" path="/deliveries" active={isActive('/deliveries')} onClick={onClose} />
          <SidebarItem icon={Users} label="Riders" path="/riders" active={isActive('/riders')} onClick={onClose} />
          <SidebarItem icon={MessageSquare} label="Messages" path="/chat" active={isActive('/chat')} onClick={onClose} />
          <SidebarItem icon={Wallet} label="Finance" path="/finance" active={isActive('/finance')} onClick={onClose} />
          <div className="pt-6 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            System
          </div>
          <SidebarItem icon={Settings} label="Settings" path="/settings" active={isActive('/settings')} onClick={onClose} />
          <SidebarItem icon={LifeBuoy} label="Support" path="/support" active={isActive('/support')} onClick={onClose} />
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 h-16 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <Menu size={24} />
        </button>
        <h2 className="text-gray-700 dark:text-gray-200 font-medium hidden sm:block">Company Admin Portal</h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.first_name || user.username || 'Admin User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.role || 'Manager'}</p>
          </div>
          <div className="h-9 w-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <UserIcon size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-200">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Main App & Routes ---

const Support = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Support & Disputes</h1>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center py-12">
      <LifeBuoy size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No active disputes</h3>
      <p className="text-gray-500">Great job! All deliveries are running smoothly.</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  // Check real auth state from tokens
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // Check if user has a company
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  // If user is company_admin but has no company, redirect to onboarding
  // We check for company field or some other indicator.
  // NOTE: The current login API might NOT return company if it's null.
  // We assume if they hit a 403 on dashboard it's because of this, but here we can preemptively check if we have the info.
  // For now, let's rely on the fact that we will update user object in onboarding.
  // A robust check would require fetching profile, but we want to avoid blocking every nav.

  // Logic:
  // If we are NOT on /onboarding and user has no company, we MIGHT need to redirect.
  // But ProtectedRoute handles all protected pages.
  // We need to differentiate between "needs onboarding" and "is fully set up".

  // Let's modify logic:
  // If user.role === 'company_admin' && !user.company && window.location.pathname !== '/onboarding', redirect to /onboarding

  if (user.role === 'company_admin' && !user.company && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={
              isAuthenticated() ? (
                // If already has company, go to dashboard
                JSON.parse(localStorage.getItem('user') || '{}').company ?
                  <Navigate to="/dashboard" replace /> :
                  <Onboarding />
              ) : <Navigate to="/" replace />
            } />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/deliveries" element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
            <Route path="/riders" element={<ProtectedRoute><Riders /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;