import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import useAppStore from './store/useAppStore';

// Lazy load de chaque page — chargées seulement quand l'utilisateur y accède
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const CGU            = lazy(() => import('./pages/CGU'));
const Home           = lazy(() => import('./pages/Home'));
const Expenses       = lazy(() => import('./pages/Expenses'));
const MonthlyExpenses = lazy(() => import('./pages/MonthlyExpenses'));
const Revenues       = lazy(() => import('./pages/Revenues'));
const Categories     = lazy(() => import('./pages/Categories'));
const Analytics      = lazy(() => import('./pages/Analytics'));
const Tickets        = lazy(() => import('./pages/TicketsPage'));

// Spinner de fallback pendant le chargement d'un chunk
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '0.75rem',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
  }}>
    <div className="spinner" />
    Chargement…
  </div>
);

// Intercepte le retour du redirect Google (?jwt=...&id=...&email=...&nom=...&prenom=...)
const GoogleCallbackHandler = () => {
  const navigate = useNavigate();
  const { loginFromGoogleCallback } = useAppStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jwt = params.get('jwt');
    const id  = params.get('id');

    if (jwt && id) {
      loginFromGoogleCallback({
        jwt,
        id,
        email:  params.get('email')  ?? '',
        nom:    params.get('nom')    ?? '',
        prenom: params.get('prenom') ?? '',
      });
      toast.success('Connexion Google réussie !');
      navigate('/', { replace: true });
    }
  }, []);

  return null;
};

const ProtectedRoute = ({ children }) => {
  const { token } = useAppStore();
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }) => {
  const { token } = useAppStore();
  if (token) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <GoogleCallbackHandler />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login"    element={<PublicRoute><Login    /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/cgu"      element={<CGU />} />

          {/* Routes protégées */}
          <Route path="/"                 element={<ProtectedRoute><Home            /></ProtectedRoute>} />
          <Route path="/analytics"        element={<ProtectedRoute><Analytics       /></ProtectedRoute>} />
          <Route path="/monthly-expenses" element={<ProtectedRoute><MonthlyExpenses /></ProtectedRoute>} />
          <Route path="/expenses"         element={<ProtectedRoute><Expenses        /></ProtectedRoute>} />
          <Route path="/revenues"         element={<ProtectedRoute><Revenues        /></ProtectedRoute>} />
          <Route path="/categories"       element={<ProtectedRoute><Categories      /></ProtectedRoute>} />
          <Route path="/tickets"          element={<ProtectedRoute><Tickets         /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        limit={3}
      />
    </BrowserRouter>
  );
}

export default App;
