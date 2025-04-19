import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Sidebar from "./component/Sidebar";
import ContactsPage from "./pages/Contact";
import Dashboard from "./pages/Dashbord";
import Corporate from "./pages/Corporate";
import Register from "./pages/Register";
import { useAuth } from "./AuthContext";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !window.location.pathname.includes('/login')) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      {isAuthenticated && (
        <div className={`sidebar-container fixed lg:static z-30 w-64 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isAuthenticated && (
          <header className="lg:hidden bg-white shadow-sm">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
              <div className="w-6"></div>
            </div>
          </header>
        )}

        {/* Routes */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className=" mx-auto">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
              
              {/* Protected Routes */}
              {isAuthenticated ? (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/contact" element={<ContactsPage />} />
                  <Route path="/corporate" element={<Corporate />} />
                  <Route path="/register" element={<Register />} />
                  {/* Redirect any unmatched route to dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </>
              ) : (
                /* Redirect unauthenticated users to login */
                <Route path="*" element={<Navigate to="/login" />}
              />
              )}
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;