import React, { useEffect } from "react";
import { FaHome, FaChartBar, FaCog, FaUsers, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const log_out = () => {
    const confirm = window.confirm("Are you sure you want to logout?");
    if (confirm) {
      logout();
    }
  };

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location, setSidebarOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ease-in-out z-30
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1 p-2">
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === '/dashboard' ? 'bg-gray-700' : ''}
                  `}
                >
                  <FaHome className="flex-shrink-0" size={20} />
                  <span className="ml-3">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === '/contact' ? 'bg-gray-700' : ''}
                  `}
                >
                  <FaUsers className="flex-shrink-0" size={20} />
                  <span className="ml-3">Contacts</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/corporate"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === '/corporate' ? 'bg-gray-700' : ''}
                  `}
                >
                  <FaChartBar className="flex-shrink-0" size={20} />
                  <span className="ml-3">Corporate</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === '/register' ? 'bg-gray-700' : ''}
                  `}
                >
                  <FaCog className="flex-shrink-0" size={20} />
                  <span className="ml-3">Register</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Footer with logout */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={log_out}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaSignOutAlt className="flex-shrink-0" size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;