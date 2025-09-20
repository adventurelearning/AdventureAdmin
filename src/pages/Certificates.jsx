import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import certificateTemplate from '../assets/certificate.jpeg'; // Import the template

const Certificates = () => {
  const [formData, setFormData] = useState({
    name: '',
    certificateNumber: '',
    mobileNumber: '',
    course: '',
    startDate: null,
    endDate: null,
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
  const [studentCertificate, setStudentCertificate] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  const certificateRef = useRef(null);

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

  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/certificates`, {
        name: formData.name,
        certificateNumber: formData.certificateNumber,
        mobileNumber: formData.mobileNumber,
        course: formData.course,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        generateCredentials: formData.generateCredentials,
        username: formData.username,
        password: formData.password
      });

      if (formData.generateCredentials && response.data.credentials) {
        setGeneratedCredentials(response.data.credentials);
        setMessage('Certificate created successfully with student credentials!');
      } else {
        setMessage('Certificate created successfully!');
      }

      setIsError(false);
      setFormData({
        name: '',
        certificateNumber: '',
        mobileNumber: '',
        course: '',
        startDate: null,
        endDate: null,
        generateCredentials: false,
        username: '',
        password: ''
      });
      setDuration(0);
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
      setPreviewCertificate(certificate);

      // Wait for the state to update and the preview to render
      setTimeout(async () => {
        if (certificateRef.current) {
          html2canvas(certificateRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: null
          }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const imgWidth = 297; // A4 width in mm (landscape)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Generate PDF and download
            const pdfFileName = `${certificate.name}_${certificate.certificateNumber}.pdf`;
            pdf.save(pdfFileName);

            setPreviewCertificate(null);
          }).catch(error => {
            console.error('Error generating PDF:', error);
            setMessage('Error generating certificate PDF');
            setIsError(true);
            setPreviewCertificate(null);
          });
        }
      }, 500);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setMessage('Error downloading certificate');
      setIsError(true);
      setPreviewCertificate(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateForCertificate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Certificate Management System</h1>

      {/* Certificate Preview (Hidden) */}
      {previewCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Certificate Preview</h3>
              <button
                onClick={() => setPreviewCertificate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div ref={certificateRef} className="bg-white p-8 relative" style={{ width: '842px', height: '595px' }}>
              <div className="absolute inset-0">
                <img
                  src={certificateTemplate}
                  alt="Certificate Template"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="relative z-10 mt-56 flex flex-col items-center justify-center">
                <div className="text-center w-full px-16">
                  <p className="text-4xl font-bold py-4 mx-20"
                    style={{ fontFamily: 'serif', fontWeight: 'bold' }}>
                    {previewCertificate.name}
                  </p>
                </div>

                <div className="text-center mb-4 w-full px-16">
                  <div className="flex flex-col items-center">
                    <div className='flex gap-2'>
                      <p className="">for successfully completing the</p>
                      <p className="font-semibold uppercase tracking-wide" style={{ fontFamily: 'serif' }}>
                        {previewCertificate.course}
                      </p>
                      <p className="">Course at </p>
                    </div>
                    <div className='flex gap-2'>
                      <p className="">Adventure Learning</p>
                      <p className="">
                        During
                      </p>
                      <p className="font-semibold">
                        {formatDateForCertificate(previewCertificate.startDate)} to{' '}
                        {formatDateForCertificate(previewCertificate.endDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className=" flex text-center mb-8 gap-1">
                  <p className="text-lg font-semibold ">Certificate NO:</p>
                  <p className="text-lg ">{previewCertificate.certificateNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New Certificate</h2>
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

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? 'Creating...' : 'Create Certificate'}
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