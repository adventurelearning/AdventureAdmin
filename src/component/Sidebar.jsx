import React, { useEffect } from "react";
import {
  FaHome,
  FaChartBar,
  FaUserTie,
  FaUsers,
  FaSignOutAlt,
  FaTimes,
  FaBook,
  FaLaptopCode,
  FaGraduationCap,
  FaEnvelope,
  FaBriefcase,
  FaUserCog,
  FaFileAlt,
  FaBloggerB
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { PiCertificateFill } from "react-icons/pi";

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
          ${sidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0 lg:w-64"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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
              {/* Custom scrollbar styling */}
              <style jsx>{`
                nav::-webkit-scrollbar {
                  width: 6px;
                }
                nav::-webkit-scrollbar-track {
                  background: #2d3748;
                }
                nav::-webkit-scrollbar-thumb {
                  background: #4a5568;
                  border-radius: 3px;
                }
                nav::-webkit-scrollbar-thumb:hover {
                  background: #718096;
                }
              `}</style>

              <li>
                <div className="mt-2">
                  <hr className="border-gray-700" />
                  <h3 className="px-3 text-sm font-semibold my-2 uppercase tracking-wider text-gray-400">
                    Adventure Learning
                  </h3>
                  <hr className="border-gray-700" />
                </div>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/dashboard" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaHome className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/contact" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaUsers className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Contacts</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/corporate"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/corporate" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaUserTie className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Corporate</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/register" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaUserCog className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Register</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/certificate"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/certificate" ? "bg-gray-700" : ""}
                  `}
                >
                  <PiCertificateFill className="flex-shrink-0 text-gray-300" size={20} />
                  <span className="ml-3">Certificate</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/blog"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/blog" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaBloggerB className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Blog</span>
                </Link>
              </li>

              <li>
                <div className="mt-4">
                  <hr className="border-gray-700" />
                  <h3 className="px-3 text-sm font-semibold my-2 uppercase tracking-wider text-gray-400">
                    Adventure Technology
                  </h3>
                  <hr className="border-gray-700" />
                </div>
              </li>
              {/* <li>
                <Link
                  to="/test"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/test" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaBook className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Test</span>
                </Link>
              </li> */}
              <li>
                <Link
                  to="/intern"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/intern" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaGraduationCap className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Intern</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/tech-contact"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/tech-contact" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaEnvelope className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Tech Contact</span>
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/Career"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/Career" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaBriefcase className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Job Applications</span>
                </Link>
              </li> */}
              <li>
                <Link
                  to="/job-application"
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors
                    ${location.pathname === "/job-application" ? "bg-gray-700" : ""}
                  `}
                >
                  <FaFileAlt className="flex-shrink-0 text-gray-300" size={18} />
                  <span className="ml-3">Job Applications</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Footer with logout */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={log_out}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
            >
              <FaSignOutAlt className="flex-shrink-0" size={18} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;