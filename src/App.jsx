import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Sidebar from "./component/Sidebar";
import ContactsPage from "./pages/Contact";
import Dashboard from "./pages/Dashbord";
import Corporate from "./pages/Corporate";
import Register from "./pages/Register";
import { useAuth } from "./AuthContext";
import Test from "./pages/Test";
import Intern from "./pages/Intern";
import TechContact from "./pages/TechContact";
import JobApplication from "./pages/JobApplication";
import BlogList from "./pages/blog/BlogList";
import CreateBlog from "./pages/blog/CreateBlog";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !window.location.pathname.includes('/login')) {
      navigate("/login");
    }
  }, [isAuthenticated,]);

  return (
    <div className="max-w-screen flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Sidebar - now properly positioned for all screen sizes */}
      {isAuthenticated && (
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        // On mobile, content stays full width (sidebar overlays)
        // On desktop, we add margin when sidebar is present
        isAuthenticated ? "lg:ml-64" : ""
        }`}>
        {/* Mobile Header */}
        {isAuthenticated && (
          <header className="lg:hidden bg-white shadow-sm z-10">
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto">
            <Routes>
              <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

              {isAuthenticated ? (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/contact" element={<ContactsPage />} />
                  <Route path="/corporate" element={<Corporate />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/intern" element={<Intern />} />
                  <Route path="/tech-contact" element={<TechContact />} />
                  <Route path="/job-application" element={<JobApplication />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                  <Route path="blog">
                    <Route index element={<BlogList />} />
                    <Route path="add-blog" element={<CreateBlog />} />
                    <Route path="edit-blog/:id" element={<CreateBlog />} />
                  </Route>
                </>
              ) : (
                <Route path="*" element={<Navigate to="/login" />} />
              )}
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;