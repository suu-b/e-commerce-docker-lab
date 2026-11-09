import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Addresses from './components/Addresses';
import Orders from './components/Orders';
import Payments from './components/Payments';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <h1>E-Commerce Store</h1>
        <div className="nav-links">
          <a href="/addresses">Addresses</a>
          <a href="/orders">Orders</a>
          <a href="/payments">Payments</a>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="*" element={<Navigate to="/addresses" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
