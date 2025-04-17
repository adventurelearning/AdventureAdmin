import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const details = await axios.get(`${VITE_BACKEND_URL}/api/contacts`);
        const sortedContacts = details.data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setContacts(sortedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a"); // e.g., "Jul 2, 2024 3:45 PM"
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };
  const exportContactsToExcel = () => {
    const worksheetData = contacts.map((contact) => ({
      Name: contact.name,
      Email: contact.email,
      Phone: contact.phone_number,
      Subject: contact.sub,
      Message: contact.message,
      "Received At": formatDate(contact.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "contact_enquiries.xlsx");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Contact Enquiries
          </h2>
          <p className="text-gray-600 mt-2">
            List of all contact enquiries received
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total: {contacts.length}{" "}
            {contacts.length === 1 ? "enquiry" : "enquiries"}
          </div>
          <button
            onClick={exportContactsToExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
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
        ) : contacts.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            No contact enquiries found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
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
                    Subject
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Received
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {contacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contact.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          contact.sub === "General Inquiry"
                            ? "bg-green-100 text-green-800"
                            : contact.sub === "Support"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {contact.sub}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(contact.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">via Website</div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-gray-500 line-clamp-2"
                        title={contact.message}
                      >
                        {contact.message}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination would go here if needed */}
      {/* <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing 1 to 10 of {contacts.length} entries
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded text-sm">Previous</button>
          <button className="px-3 py-1 border rounded bg-blue-500 text-white text-sm">Next</button>
        </div>
      </div> */}
    </div>
  );
};

export default ContactsPage;
