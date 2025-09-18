import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Certificates = () => {
  const [formData, setFormData] = useState({
    name: '',
    certificateNumber: '',
    mobileNumber: '',
    course: '',
    startDate: null,
    endDate: null,
    image: null
  });
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [duration, setDuration] = useState(0);

  // Fetch certificates and courses on component mount
  useEffect(() => {
    fetchCertificates();
    fetchCourses();
  }, []);

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = Math.abs(end.getTime() - start.getTime());
      const calculatedDuration = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      setDuration(calculatedDuration);
    } else {
      setDuration(0);
    }
  }, [formData.startDate, formData.endDate]);

  // Filter certificates when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = certificates.filter(cert => 
        cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateNumber.includes(searchTerm) ||
        cert.mobileNumber.includes(searchTerm) ||
        cert.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCertificates(filtered);
    } else {
      setFilteredCertificates(certificates);
    }
  }, [searchTerm, certificates]);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/certificates`);
      setCertificates(response.data);
      setFilteredCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setMessage('Error fetching certificates');
      setIsError(true);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage('Error fetching courses');
      setIsError(true);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file (JPEG, PNG, etc.)');
      setIsError(true);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage('File size too large. Maximum size is 5MB.');
      setIsError(true);
      return;
    }

    setFormData({
      ...formData,
      image: file
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!formData.image) {
      setMessage('Please select an image file');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setMessage('Please select both start and end dates');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setMessage('End date must be after start date');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('certificateNumber', formData.certificateNumber);
    data.append('mobileNumber', formData.mobileNumber);
    data.append('course', formData.course);
    data.append('startDate', formData.startDate.toISOString());
    data.append('endDate', formData.endDate.toISOString());
    data.append('image', formData.image);

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/certificates`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Certificate uploaded successfully!');
      setIsError(false);
      setFormData({ 
        name: '', 
        certificateNumber: '', 
        mobileNumber: '', 
        course: '',
        startDate: null,
        endDate: null,
        image: null 
      });
      setDuration(0);
      document.getElementById('image').value = '';
      fetchCertificates(); // Refresh the list
    } catch (error) {
      let errorMessage = 'Error uploading certificate: ';
      
      if (error.response) {
        errorMessage += error.response.data?.message || error.response.statusText;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        errorMessage += error.message;
      }
      
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    setDeleteId(id);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/${id}`);
      setMessage('Certificate deleted successfully!');
      setIsError(false);
      fetchCertificates(); // Refresh the list
    } catch (error) {
      setMessage('Error deleting certificate');
      setIsError(true);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleDownload = async (certificate) => {
    try {
      // Fetch the image as a blob
      const response = await fetch(certificate.imageUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${certificate.name}_${certificate.certificateNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setMessage('Error downloading certificate');
      setIsError(true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Certificate Management System</h1>
      
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upload New Certificate</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-3 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="certificateNumber">
                Certificate Number
              </label>
              <input
                type="text"
                id="certificateNumber"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="mobileNumber">
                Mobile Number
              </label>
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="course">
                Course
              </label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="startDate">
                Start Date
              </label>
              <DatePicker
                id="startDate"
                selected={formData.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                selectsStart
                startDate={formData.startDate}
                endDate={formData.endDate}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select start date"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="endDate">
                End Date
              </label>
              <DatePicker
                id="endDate"
                selected={formData.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                selectsEnd
                startDate={formData.startDate}
                endDate={formData.endDate}
                minDate={formData.startDate}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="Select end date"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="duration">
                Duration (days)
              </label>
              <input
                type="text"
                id="duration"
                value={duration}
                className="w-full px-3 py-2 border rounded bg-gray-100"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="image">
              Certificate Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept="image/*"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Uploading...' : 'Upload Certificate'}
          </button>
        </form>
      </div>

      {/* Search and List Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Certificate List</h2>
        
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, certificate number, mobile number, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Certificates Table */}
        {filteredCertificates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Certificate Number</th>
                  <th className="py-2 px-4 border-b">Mobile Number</th>
                  <th className="py-2 px-4 border-b">Course</th>
                  <th className="py-2 px-4 border-b">Duration (days)</th>
                  <th className="py-2 px-4 border-b">Start Date</th>
                  <th className="py-2 px-4 border-b">End Date</th>
                  <th className="py-2 px-4 border-b">Image</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((cert) => (
                  <tr key={cert._id}>
                    <td className="py-2 px-4 border-b">{cert.name}</td>
                    <td className="py-2 px-4 border-b">{cert.certificateNumber}</td>
                    <td className="py-2 px-4 border-b">{cert.mobileNumber}</td>
                    <td className="py-2 px-4 border-b">{cert.course}</td>
                    <td className="py-2 px-4 border-b">{cert.duration}</td>
                    <td className="py-2 px-4 border-b">{formatDate(cert.startDate)}</td>
                    <td className="py-2 px-4 border-b">{formatDate(cert.endDate)}</td>
                    <td className="py-2 px-4 border-b">
                      <img 
                        src={cert.imageUrl} 
                        alt={cert.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(cert)}
                          className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(cert._id)}
                          disabled={isDeleting && deleteId === cert._id}
                          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {isDeleting && deleteId === cert._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            {searchTerm ? 'No certificates match your search' : 'No certificates found'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Certificates;