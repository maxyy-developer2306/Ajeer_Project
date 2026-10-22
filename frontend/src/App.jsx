import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/AdminDashboardPage';
import PermitFormPage from './pages/PermitFormPage';
import VerificationPortal from './pages/Verification_Portal';
import { getToken } from './services/authService';

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={getToken() ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={getToken() ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/permit-form" element={<ProtectedRoute><PermitFormPage /></ProtectedRoute>} />
      <Route path="/permit-form/:id" element={<ProtectedRoute><PermitFormPage /></ProtectedRoute>} />
      <Route path="/Verification_Portal/:id" element={<VerificationPortal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
