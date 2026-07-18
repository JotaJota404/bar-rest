/**
 * App.jsx — Roteamento principal do PDV "Buteco da Gente"
 * MVP: Frontend-only mode
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import Login from './pages/Login';
import Mesas from './pages/Mesas';
import Pedidos from './pages/Pedidos';
import Comanda from './pages/Comanda';

// Um PrivateRoute simples (mock)
function PrivateRoute({ children }) {
  const isAuth = localStorage.getItem('pdv_token') !== null;
  return isAuth ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/mesas" element={
            <PrivateRoute>
              <Mesas />
            </PrivateRoute>
          } />
          
          <Route path="/pedidos/:mesaId" element={
            <PrivateRoute>
              <Pedidos />
            </PrivateRoute>
          } />
          
          <Route path="/comanda/:mesaId" element={
            <PrivateRoute>
              <Comanda />
            </PrivateRoute>
          } />

          {/* Rota raiz redireciona para mesas (ou login se não auth) */}
          <Route path="/" element={<Navigate to="/mesas" replace />} />
          <Route path="*" element={<Navigate to="/mesas" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
