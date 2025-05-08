import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import * as XLSX from "xlsx";

const Intern = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${VITE_BACKEND_URL}/api/intern`);
        setInterns(response.data.data);
      } catch (error) {
        console.error("Error fetching interns:", error);
        setError("Failed to load intern data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterns();
  }, []);

  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        intern.fullName?.toLowerCase().includes(searchLower) ||
        intern.email?.toLowerCase().includes(searchLower) ||
        intern.collegeName?.toLowerCase().includes(searchLower) ||
        intern.internshipDomain?.toLowerCase().includes(searchLower)
      );
    });
  }, [interns, searchTerm]);

  const formatDate = (dateString) => {
    const date = parseISO(dateString);
    return format(date, "MMM dd, yyyy hh:mm a");
  };

  const exportToExcel = () => {
    const data = filteredInterns.map((intern) => ({
      "Full Name": intern.fullName || "N/A",
      Email: intern.email || "N/A",
      Phone: intern.contactNumber || "N/A",
      College: intern.collegeName || "N/A",
      Degree: intern.degree || "N/A",
      Course: intern.mainCourse || "N/A",
      "Internship Field": intern.internshipDomain || "N/A",
      Comments: intern.additionalComments || "N/A",
      "Resume URL": intern.resumeUrl || "N/A",
      "Registered Date": formatDate(intern.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Interns");
    XLSX.writeFile(workbook, "Intern_Registrations.xlsx");
  };

  const showInternDetails = (intern) => {
    const details = `
      Full Name: ${intern.fullName || "N/A"}
      Email: ${intern.email || "N/A"}
      Phone: ${intern.contactNumber || "N/A"}
      College: ${intern.collegeName || "N/A"}
      Degree: ${intern.degree || "N/A"}
      Course: ${intern.mainCourse || "N/A"}
      Internship Field: ${intern.internshipDomain || "N/A"}
      Comments: ${intern.additionalComments || "N/A"}
      Resume: ${intern.resumeUrl ? "Available" : "Not provided"}
      Registered: ${formatDate(intern.createdAt)}
    `;

    // alert(details);

    // Alternative: Open in new window with formatted content
    const detailsWindow = window.open("", "_blank");
    detailsWindow.document.write(`
      <html>
        <head><title>Intern Details</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Intern Details</h2>
          <pre>${details}</pre>
          ${
            intern.resumeUrl
              ? `<a href="${intern.resumeUrl}" target="_blank">View Resume</a>`
              : ""
          }
        </body>
      </html>
    `);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Registered Interns
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredInterns.length}{" "}
              {filteredInterns.length === 1 ? "intern" : "interns"} found
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search interns..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export to Excel
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intern
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Education
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInterns.length > 0 ? (
                    filteredInterns.map((intern) => (
                      <tr key={intern._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-medium">
                                {intern.fullName?.charAt(0).toUpperCase() ||
                                  "I"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {intern.fullName || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {intern.collegeName || "No university provided"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {intern.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {intern.contactNumber || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {intern.degree.toUpperCase() || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {intern.mainCourse || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {intern.internshipDomain || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(intern.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => showInternDetails(intern)}
                            className="text-green-600 hover:text-green-900"
                            title="View Details"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              window.location.href = `mailto:${intern.email}`;
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Send Email"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                          {intern.resumeUrl && (
                            <a
                              href={intern.resumeUrl}
                              download
                              className="text-purple-600 hover:text-purple-900"
                              title="Download Resume"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No interns found{" "}
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

export default Intern;
