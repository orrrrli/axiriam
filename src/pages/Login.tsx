import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import logo from '../assets/images/logo.png';

const Login: React.FC = () => {
  const { login, register, resetPassword, isLoading } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (currentView === 'login') {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } else if (currentView === 'register') {
      if (!email || !password || !confirmPassword || !name) {
        setError('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      const result = await register(email, password, name);
      if (result.success) {
        setSuccess('Registration successful! Please check your email to confirm your account.');
        setCurrentView('login');
        resetForm();
      } else {
        setError(result.error || 'Registration failed');
      }
    } else if (currentView === 'forgot-password') {
      if (!email) {
        setError('Please enter your email address');
        return;
      }

      const result = await resetPassword(email);
      if (result.success) {
        setSuccess('Password reset email sent! Please check your inbox.');
        setCurrentView('login');
        resetForm();
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    }
  };

  const switchView = (view: 'login' | 'register' | 'forgot-password') => {
    setCurrentView(view);
    resetForm();
  };

  const getTitle = () => {
    switch (currentView) {
      case 'register':
        return 'Crear Cuenta';
      case 'forgot-password':
        return 'Recuperar Contraseña';
      default:
        return 'Iniciar Sesión';
    }
  };

  const getButtonText = () => {
    switch (currentView) {
      case 'register':
        return 'Registrarse';
      case 'forgot-password':
        return 'Enviar Email de Recuperación';
      default:
        return 'Iniciar Sesión';
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg relative">
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {currentView !== 'login' && (
          <button
            onClick={() => switchView('login')}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Back to login"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        <div className="text-center">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="Logo"
              className="h-36 w-36"
            />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Axiriam
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sistema de gestión de materiales
          </p>
          <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
            {getTitle()}
          </h3>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {currentView === 'register' && (
              <Input
                label="Nombre Completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                required
                fullWidth
              />
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu email"
              required
              fullWidth
            />

            {currentView !== 'forgot-password' && (
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                fullWidth
              />
            )}

            {currentView === 'register' && (
              <Input
                label="Confirmar Contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu contraseña"
                required
                fullWidth
              />
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 dark:text-green-400 text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              {success}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            {getButtonText()}
          </Button>

          <div className="text-center space-y-2">
            {currentView === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="text-sm text-primary-light dark:text-primary-dark hover:underline block"
                >
                  ¿No tienes cuenta? Regístrate
                </button>
                <button
                  type="button"
                  onClick={() => switchView('forgot-password')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline block"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </>
            )}

            {currentView === 'register' && (
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-sm text-primary-light dark:text-primary-dark hover:underline"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            )}

            {currentView === 'forgot-password' && (
              <button
                type="button"
                onClick={() => switchView('login')}
                className="text-sm text-primary-light dark:text-primary-dark hover:underline"
              >
                Volver al inicio de sesión
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;