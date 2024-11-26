import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../DB/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../App.css';

const ProfilePopupClient = ({ onClose }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
      }
      setLoading(false);
    }
  };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, userData);
      alert('Profile updated successfully!');
      onClose();
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `${auth.currentUser.uid}/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { fileURL });
      
      setUserData((prevData) => ({ ...prevData, fileURL }));
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      alert('Logged out successfully!');
      window.location.reload();
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="popup-overlay active">
      <div className="profile-popup-content">
        <h2>Edit Profile</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <form>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData?.email || ''}
            readOnly
          />
          <br />
          <label htmlFor="name">name:</label>
          <input
            type="name"
            id="name"
            name="name"
            value={userData?.name || ''}
            readOnly
          />
          <br />
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            name="age"
            value={userData?.age || ''}
            onChange={handleChange}
          />
          <br />
          <label htmlFor="height">Height:</label>
          <input
            type="number"
            id="height"
            name="height"
            value={userData?.height || ''}
            onChange={handleChange}
          />
          <br />
          <label htmlFor="weight">Weight:</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={userData?.weight || ''}
            onChange={handleChange}
          />
          <br />
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={userData?.address || ''}
            onChange={handleChange}
          />
          <br />
          <label htmlFor="description">goal:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={userData?.description || ''}
            onChange={handleChange}
          />
          <br />
          <label htmlFor="fileUpload">Upload File:</label>
          <input type="file" id="fileUpload" onChange={handleFileChange} />
          {uploading ? (
            <p>Uploading...</p>
          ) : (
            <button type="button" onClick={handleFileUpload}>Upload File</button>
          )}
          <br />

          {userData?.fileURL && (
            <div>
              <p>Uploaded File: <a href={userData.fileURL} target="_blank" rel="noopener noreferrer">View/Download</a></p>
            </div>
          )}

          <button type="button" onClick={handleSave}>Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" onClick={handleLogout}>Logout</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePopupClient;
