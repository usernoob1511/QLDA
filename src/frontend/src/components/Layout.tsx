import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser } from 'react-icons/fi';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/'); // Chuyển về trang layout (trang chủ)
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              QLDA E-commerce
            </Link>
            <nav className="flex items-center space-x-4">
              <Link to="/products" className="text-gray-600 hover:text-gray-900">
                Products
              </Link>
              <Link to="/cart" className="relative text-gray-600 hover:text-gray-900">
                <FiShoppingCart className="h-6 w-6" />
              </Link>
              {isLoggedIn ? (
                <>
                  <span className="flex items-center ml-4 mr-2 text-gray-700 font-medium">
                    <FiUser className="mr-1" />
                    {user?.Name || user?.Email || 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link to="/login" className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-gray-400">
                QLDA E-commerce is your one-stop shop for all your shopping needs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-white">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-gray-400 hover:text-white">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: support@qlda-ecommerce.com<br />
                Phone: (123) 456-7890
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} QLDA E-commerce. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;