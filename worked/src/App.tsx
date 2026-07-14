import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerPage from './components/Customer/CustomerPage';
import OwnerDashboard from './components/Owner/OwnerDashboard';
import SignIn from './components/Auth/SignIn';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRouter() {
  const { isLoggedIn, userId } = useAuth();
  const [currentView, setCurrentView] = useState<'customer' | 'owner'>('customer');

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f5f1eb' }}>
              <button
                onClick={() => setCurrentView('customer')}
                style={{
                  padding: '8px 16px',
                  background: currentView === 'customer' ? '#a5c9a0' : '#ddd',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                Customer
              </button>
              <button
                onClick={() => setCurrentView('owner')}
                style={{
                  padding: '8px 16px',
                  background: currentView === 'owner' ? '#c89968' : '#ddd',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                Owner
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              {currentView === 'customer' ? (
                <CustomerPage ownerId="demo-owner" />
              ) : isLoggedIn && userId ? (
                <OwnerDashboard ownerId={userId} />
              ) : (
                <SignIn />
              )}
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}
