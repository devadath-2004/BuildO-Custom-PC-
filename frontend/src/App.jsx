import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ConfiguratorPage from './pages/ConfiguratorPage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import PresetsPage from './pages/PresetsPage';
import { CheckCircle2, AlertCircle, Info, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto my-24 p-8 rounded-3xl glass-panel border border-rose-500/40 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Unable to display page</h2>
          <p className="text-xs text-slate-400">
            A minor view error occurred. Click below to refresh and return to the home screen.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.hash = 'home';
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d8ff43] hover:bg-[#cafa25] text-[#171910] font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { 
    user,
    activePage, 
    notification 
  } = useApp();
  const isHomePage = activePage === 'home';

  // Navigation based on activePage
  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'login':
        return <LoginPage />;
      case 'configurator':
      case 'build':
        return <ConfiguratorPage />;
      case 'presets':
        return <PresetsPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'orders':
        return <OrdersPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  // Toast notification (shown on both login and app)
  const toastBanner = notification && (
    <div className="fixed top-4 right-4 sm:right-8 z-50">
      <div
        className={`px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-xl ${
          notification.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            : notification.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-[#191b14]/95 border-[#d8ff43]/40 text-[#efffbd]'
        }`}
      >
        {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
        {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
        {notification.type === 'info' && <Info className="w-4 h-4 text-[#d8ff43] flex-shrink-0" />}
        <span>{notification.message}</span>
      </div>
    </div>
  );

  // Keep protected app pages behind authentication, but let visitors see the landing page.
  if (!user && activePage !== 'home') {
    return (
      <div className="min-h-screen text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
        {toastBanner}
        <ErrorBoundary>
          <LoginPage />
        </ErrorBoundary>
      </div>
    );
  }

  // Logged in → show only Homepage or Build Page with Navbar and Footer
  return (
      <div className={`min-h-screen flex flex-col font-sans relative ${isHomePage ? 'text-slate-100 selection:bg-cyan-500 selection:text-slate-950' : 'buildo-app-shell text-slate-100 selection:bg-[#d8ff43] selection:text-[#171910]'}`}>
      {toastBanner}

      {!isHomePage && <Navbar />}

      <main className="flex-1">
        <ErrorBoundary>
          {renderActivePage()}
        </ErrorBoundary>
      </main>

      {!isHomePage && <Footer />}
    </div>
  );
}
