import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Register = () => {
  const [registeredData, setRegisteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrainingMode, setSelectedTrainingMode] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [editingStatus, setEditingStatus] = useState(null);
  const [tempStatus, setTempStatus] = useState("");
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await axios.get(`${VITE_BACKEND_URL}/api/register`);
        const sortedData = response.data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRegisteredData(sortedData);
      } catch (error) {
        console.error("Error fetching registered data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const exportToExcel = () => {
    const worksheetData = registeredData.map((item) => ({
      Name: item.name,
      Email: item.email,
      Phone: item.phone_number,
      Courses: item.courses,
      "Training Mode": item.training_mode,
      Status: item.status || "Not set",
      "Registered Date": formatDate(item.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "registered_users.xlsx");
  };

  // Get unique training modes and statuses for filters
  const trainingModes = [
    "All",
    ...new Set(registeredData.map((item) => item.training_mode)),
  ];

  const statusOptions = [
    "All",
    "Pending",
    "Confirmed",
    "Rejected",
    "Completed",
    "Cancelled",
  ];

  const filteredData = registeredData.filter((registration) => {
    const matchesSearch =
      registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.phone_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      registration.courses.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTrainingMode =
      selectedTrainingMode === "All" ||
      registration.training_mode === selectedTrainingMode;

    const matchesStatus =
      selectedStatus === "All" ||
      (registration.status ? registration.status === selectedStatus : selectedStatus === "All");

    return matchesSearch && matchesTrainingMode && matchesStatus;
  });

  const handleStatusUpdate = async (id) => {
    try {
      await axios.put(`${VITE_BACKEND_URL}/api/register/${id}`, {
        status: tempStatus,
      });
      setRegisteredData(
        registeredData.map((item) =>
          item._id === id ? { ...item, status: tempStatus } : item
        )
      );
      setEditingStatus(null);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      try {
        await axios.delete(`${VITE_BACKEND_URL}/api/register/${id}`);
        setRegisteredData(registeredData.filter((item) => item._id !== id));
      } catch (error) {
        console.error("Error deleting registration:", error);
      }
    }
  };

  return (
    <div className="max-w-6xl sm:max-w-lg md:max-w-5xl xl:max-w-5xl mx-auto px-1 sm:px-1 lg:px-1 py-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Registered Users
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage all registered users
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="block w-full sm:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedTrainingMode}
            onChange={(e) => setSelectedTrainingMode(e.target.value)}
          >
            {trainingModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
          <select
            className="block w-full sm:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={exportToExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors text-sm"
          >
            Export to Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center p-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No registrations found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedTrainingMode !== "All" || selectedStatus !== "All"
                ? "Try adjusting your search or filter"
                : "No users have registered yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto h-screen">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
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
                    Courses
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Training Mode
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
                    Registered
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredData.map((registration) => (
                  <tr
                    key={registration._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {registration.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {registration.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {registration.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registration.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-gray-900 line-clamp-2"
                        title={registration.courses}
                      >
                        {registration.courses}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          registration.training_mode === "Online"
                            ? "bg-green-100 text-green-800"
                            : registration.training_mode === "In-Person"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {registration.training_mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStatus === registration._id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value)}
                          >
                            {statusOptions
                              .filter((status) => status !== "All")
                              .map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => handleStatusUpdate(registration._id)}
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
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              !registration.status
                                ? "bg-gray-100 text-gray-800"
                                : registration.status === "Confirmed"
                                ? "bg-green-100 text-green-800"
                                : registration.status === "Rejected" ||
                                  registration.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : registration.status === "Completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {registration.status || "Pending"}
                          </span>
                          <button
                            onClick={() => {
                              setEditingStatus(registration._id);
                              setTempStatus(registration.status || "Pending");
                            }}
                            className="ml-2 text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(registration.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          window.location.href = `mailto:${registration.email}`;
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
                      <button
                        onClick={() => handleDelete(registration._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredData.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {filteredData.length} of {registeredData.length}{" "}
            registrations
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;