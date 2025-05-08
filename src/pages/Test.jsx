import React, { useState } from 'react';

function CloudinaryPdfUpload() {
  const [url, setUrl] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'resume'); // <-- Your unsigned preset
    // DO NOT append cloud_name or resource_type in FormData

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dlw21awck/image/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (result.secure_url) {
        setUrl(result.secure_url);
        console.log('Uploaded to:', result.secure_url);
      } else {
        alert('Upload failed: ' + result.error?.message);
        console.error(result);
      }
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Error uploading PDF.');
    }
  };

  return (
    <div>
      <h2>Upload PDF to Cloudinary (Frontend Only)</h2>
      <input type="file" accept="application/pdf" onChange={handleUpload} />
      {url && (
        <p>
          Uploaded: <a href={url} target="_blank" rel="noreferrer">{url}</a>
        </p>
      )}
    </div>
  );
}

export default CloudinaryPdfUpload;
