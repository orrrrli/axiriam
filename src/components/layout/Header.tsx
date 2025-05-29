import { Bluetooth as Tooth, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();

  return (
    <header className="bg-primary-light dark:bg-primary-dark shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-24 w-24"
            />
            <h1 className="ml-2 text-2xl font-bold text-white"></h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white text-md">
              Sistema de gestión de materiales
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-white" />
              ) : (
                <Moon className="h-5 w-5 text-white" />
              )}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;