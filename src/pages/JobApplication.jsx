import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import * as XLSX from "xlsx";

const JobApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStatus, setEditingStatus] = useState(null);
  const [tempStatus, setTempStatus] = useState("");
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${VITE_BACKEND_URL}/api/jobapplication`
        );
        setApplications(response.data.data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.fullName.toLowerCase().includes(searchLower) ||
        app.email.toLowerCase().includes(searchLower) ||
        (app.phone && app.phone.includes(searchTerm)) ||
        (app.coverLetter && app.coverLetter.toLowerCase().includes(searchLower)) ||
        (app.status && app.status.toLowerCase().includes(searchLower))
      );
    });
  }, [applications, searchTerm]);

  const formatDate = (dateString) => {
    const date = parseISO(dateString);
    return format(date, "MMM dd, yyyy hh:mm a");
  };

  const exportToExcel = () => {
    const data = filteredApplications.map((app) => ({
      "Full Name": app.fullName,
      Email: app.email,
      Phone: app.phone || "N/A",
      Position: app.position || "N/A",
      Status: app.status || "N/A",
      "Cover Letter": app.coverLetter || "N/A",
      "Resume URL": app.resumeUrl,
      "Applied Date": formatDate(app.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Applications");
    XLSX.writeFile(workbook, "Job_Applications.xlsx");
  };

  const handleStatusUpdate = async (id) => {
    try {
      await axios.patch(`${VITE_BACKEND_URL}/api/jobapplication/${id}`, {
        status: tempStatus,
      });
      setApplications(
        applications.map((app) =>
          app._id === id ? { ...app, status: tempStatus } : app
        )
      );
      setEditingStatus(null);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await axios.delete(`${VITE_BACKEND_URL}/api/jobapplication/${id}`);
        setApplications(applications.filter((app) => app._id !== id));
      } catch (error) {
        console.error("Error deleting application:", error);
        setError("Failed to delete application. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-6xl sm:max-w-lg md:max-w-5xl xl:max-w-5xl mx-auto px-1 sm:px-1 lg:px-1 py-1">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Job Applications
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredApplications.length}{" "}
              {filteredApplications.length === 1
                ? "application"
                : "applications"}{" "}
              found
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search applications..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Export to Excel
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <div className="overflow-x-auto h-screen max-h-[450px] max-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Applicant
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Documents
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Applied
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">
                                {app.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {app.fullName}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                                {app.coverLetter?.slice(0, 60) ||
                                  "No cover letter"}
                                ...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {app.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.phone}
                          </div>
                          {app.position && (
                            <div className="text-sm text-indigo-600">
                              {app.position}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingStatus === app._id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                className="border rounded px-2 py-1 text-sm"
                                value={tempStatus}
                                onChange={(e) => setTempStatus(e.target.value)}
                                placeholder="Enter status"
                              />
                              <button
                                onClick={() => handleStatusUpdate(app._id)}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingStatus(null)}
                                className="text-gray-500 hover:text-gray-700 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  !app.status
                                    ? "bg-gray-100 text-gray-800"
                                    : app.status === "Approved"
                                    ? "bg-green-100 text-green-800"
                                    : app.status === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : app.status === "Completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                {app.status || "Not set"}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingStatus(app._id);
                                  setTempStatus(app.status || "");
                                }}
                                className="ml-2 text-indigo-600 hover:text-indigo-900 text-sm"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 mr-2"
                          >
                            Resume
                          </a>
                          {app.coverLetter && (
                            <button
                              onClick={() => alert(app.coverLetter)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                            >
                              View Letter
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(app.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No applications found{" "}
                        {searchTerm ? `matching "${searchTerm}"` : ""}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplication;