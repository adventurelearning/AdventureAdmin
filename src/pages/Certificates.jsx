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
    image: null,
    generateCredentials: false,
    username: '',
    password: ''
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
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [studentCertificate, setStudentCertificate] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  useEffect(() => {
    fetchCertificates();
    fetchCourses();
  }, []);

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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
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
    data.append('generateCredentials', formData.generateCredentials);
    
    // Add username and password if provided
    if (formData.generateCredentials) {
      if (formData.username) {
        data.append('username', formData.username);
      }
      if (formData.password) {
        data.append('password', formData.password);
      }
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/certificates`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (formData.generateCredentials && response.data.credentials) {
        setGeneratedCredentials(response.data.credentials);
        setMessage('Certificate uploaded successfully with student credentials!');
      } else {
        setMessage('Certificate uploaded successfully!');
      }
      
      setIsError(false);
      setFormData({ 
        name: '', 
        certificateNumber: '', 
        mobileNumber: '', 
        course: '',
        startDate: null,
        endDate: null,
        image: null,
        generateCredentials: false,
        username: '',
        password: ''
      });
      setDuration(0);
      document.getElementById('image').value = '';
      setShowCredentialsForm(false);
      fetchCertificates();
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/certificates/student-login`, loginData);
      setStudentCertificate(response.data.certificate);
      setMessage('Login successful!');
      setIsError(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
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
      fetchCertificates();
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
      const response = await fetch(certificate.imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${certificate.name}_${certificate.certificateNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
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
      <h1 className="text-3xl font-bold text-center">Certificate Management System</h1>
      
      {/* <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Student Login</h2>
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {showLogin ? 'Hide Login' : 'Show Login'}
          </button>
        </div>
        
        {showLogin && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
        
        {studentCertificate && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-xl font-semibold mb-2">Your Certificate</h3>
            <p><strong>Name:</strong> {studentCertificate.name}</p>
            <p><strong>Certificate Number:</strong> {studentCertificate.certificateNumber}</p>
            <p><strong>Course:</strong> {studentCertificate.course}</p>
            <p><strong>Duration:</strong> {studentCertificate.duration} days</p>
            <p><strong>Issue Date:</strong> {formatDate(studentCertificate.issueDate)}</p>
            <button
              onClick={() => handleDownload(studentCertificate)}
              className="mt-4 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
            >
              Download Certificate
            </button>
          </div>
        )}
      </div> */}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upload New Certificate</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-3 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
          
          {generatedCredentials && (
            <div className="p-3 bg-blue-100 text-blue-700 rounded">
              <p><strong>Student Credentials Generated:</strong></p>
              <p><strong>Username:</strong> {generatedCredentials.username}</p>
              <p><strong>Password:</strong> {generatedCredentials.password}</p>
              <p className="text-sm mt-2">Please save these credentials as they will not be shown again.</p>
              <button
                type="button"
                onClick={() => setGeneratedCredentials(null)}
                className="mt-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 text-sm"
              >
                Close
              </button>
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
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="generateCredentials"
              name="generateCredentials"
              checked={formData.generateCredentials}
              onChange={(e) => {
                handleChange(e);
                setShowCredentialsForm(e.target.checked);
              }}
              className="mr-2"
            />
            <label htmlFor="generateCredentials" className="text-gray-700">
              Generate Student Login Credentials
            </label>
          </div>

          {showCredentialsForm && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Student Credentials</h3>
              <p className="text-sm text-gray-600 mb-3">
                You can provide custom username and password, or leave blank to auto-generate.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="username">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="password"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center"> 
          <button
            type="submit"
            disabled={isLoading}
            className={` bg-blue-500 text-white py-2 px-4 rounded  hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Uploading...' : 'Upload Certificate'}
          </button>
          </div> 
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Certificate List</h2>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, certificate number, mobile number, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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