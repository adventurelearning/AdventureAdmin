import React, { useState } from "react";
import {
  FaHome,
  FaChartBar,
  FaCog,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa"; // Import icons from react-icons
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const log_out = () => {
    const confirm = window.confirm("Are you sure you want to logout?");
    if (confirm) {
      logout();
    }
  };

  return (
    <div
      className={`flex fixed ${
        collapsed ? "w-20" : "w-60"
      } h-screen bg-gray-800 text-white transition-all duration-300`}
    >
      {/* Sidebar content */}
      <div className="flex flex-col w-full">
        {/* Logo or App Name */}
        <div className="flex items-center justify-center p-4">
          <h1 className={`ml-2 text-xl ${collapsed ? "hidden" : ""}`}>
            Dashboard
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1">
          <ul>
            <li>
              <Link
                to={"/dashbord"}
                className="flex items-center p-4 hover:bg-gray-700"
              >
                <FaHome className="mr-3" />
                <h1 className={`${collapsed ? "hidden" : ""}`}>Dashboard</h1>
              </Link>
            </li>
            {/* <li>
              <a href="#" className="flex items-center p-4 hover:bg-gray-700">
                <FaChartBar className="mr-3" />
                <span className={`${collapsed ? "hidden" : ""}`}>Analytics</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-4 hover:bg-gray-700">
                <FaCog className="mr-3" />
                <span className={`${collapsed ? "hidden" : ""}`}>Settings</span>
              </a>
            </li> */}
            <li>
              <Link
                to={"/contact"}
                className="flex items-center p-4 hover:bg-gray-700"
              >
                <FaUsers className="mr-3" />
                <h1 className={`${collapsed ? "hidden" : ""}`}>Contacts</h1>
              </Link>
            </li>
            <li>
              <Link
                to={"/corporate"}
                className="flex items-center p-4 hover:bg-gray-700"
              >
                <FaUsers className="mr-3" />
                <h1 className={`${collapsed ? "hidden" : ""}`}>Corporate</h1>
              </Link>
            </li>
            <li>
              <Link
                to={"/register"}
                className="flex items-center p-4 hover:bg-gray-700"
              >
                <FaUsers className="mr-3" />
                <h1 className={`${collapsed ? "hidden" : ""}`}>Register</h1>
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  log_out();
                }}
                className="flex items-center p-4 hover:bg-gray-700"
              >
                <FaSignOutAlt className="mr-3" />
                <span className={`${collapsed ? "hidden" : ""}`}>Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Collapsed/Expanded Button */}
        {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 cursor-pointer">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 bg-gray-600 rounded-full hover:bg-gray-500 focus:outline-none"
          >
            {collapsed ? ">" : "<"}
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Sidebar;
