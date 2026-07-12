import React, { useState, useEffect } from 'react';
import { User } from './types';
import AuthScreen from './components/AuthScreen';
import ClientDashboard from './components/ClientDashboard';
import DriverDashboard from './components/DriverDashboard';
import DispatcherDashboard from './components/DispatcherDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('carryon_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('carryon_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Restore persistent session from localStorage if available
    const savedUser = localStorage.getItem('carryon_user');
    const savedToken = localStorage.getItem('carryon_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (err) {
        localStorage.removeItem('carryon_user');
        localStorage.removeItem('carryon_token');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User, sessionToken: string) => {
    setUser(loggedInUser);
    setToken(sessionToken);
    localStorage.setItem('carryon_user', JSON.stringify(loggedInUser));
    localStorage.setItem('carryon_token', sessionToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('carryon_user');
    localStorage.removeItem('carryon_token');
  };

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />;
  }

  // Route to specific role-based dashboards based on verified backend profile role
  switch (user.role) {
    case 'client':
      return <ClientDashboard user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
    case 'driver':
      return <DriverDashboard user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
    case 'dispatcher':
      return <DispatcherDashboard user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
    case 'admin':
      return <AdminDashboard user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
    default:
      return <AuthScreen onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />;
  }
}
