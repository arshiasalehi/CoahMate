import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../DB/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../App.css';

const ProfilePopupCoach = ({ onClose }) => {
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

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...userData.schedule];
    updatedSchedule[index][field] = value;
    setUserData((prevData) => ({ ...prevData, schedule: updatedSchedule }));
  };

  const handleAddSchedule = (event) => {
    event.preventDefault();  
    setUserData((prevData) => ({
      ...prevData,
      schedule: [...(prevData?.schedule || []), { date: '', time: '', description: '', price: '' }],
    }));
  };

  const handleRemoveSchedule = (index) => {
    const updatedSchedule = userData.schedule.filter((_, i) => i !== index);
    setUserData((prevData) => ({ ...prevData, schedule: updatedSchedule }));
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
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData?.name || ''}
            onChange={handleChange}
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
          <label htmlFor="weight">Weight:</label>
          <input
            type="text"
            id="weight"
            name="weight"
            value={userData?.weight || ''}
            onChange={handleChange}
          />
        <label htmlFor="height">Height:</label>
          <input
            type="text"
            id="height"
            name="height"
            value={userData?.height || ''}
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
        <label htmlFor="description">about me:</label>
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
            <button type="button" onClick={handleFileUpload}>
              Upload File
            </button>
          )}
          <br />
          {userData?.fileURL && (
            <div>
              <p>
                Uploaded File:{' '}
                <a href={userData.fileURL} target="_blank" rel="noopener noreferrer">
                  View/Download
                </a>
              </p>
            </div>
          )}

          <h3>Schedule Availability</h3>
          {Array.isArray(userData.schedule) && userData.schedule.length > 0 ? (
            userData.schedule.map((item, index) => (
              <div key={index}>
                <label>
                  Date:
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                  />
                </label>
                <label>
                  Time:
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                  />
                </label>
                <label>
                  Description:
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleScheduleChange(index, 'description', e.target.value)}
                  />
                </label>
                <label>
                  Price:
                  <input
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => handleScheduleChange(index, 'price', e.target.value)}
                  />
                </label>
                <button onClick={() => handleRemoveSchedule(index)}>Remove</button>
              </div>
            ))
          ) : (
            <p>No schedule set. Add availability below.</p>
          )}
          <button onClick={handleAddSchedule}>Add Availability</button>
          <br />

          <button type="button" onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePopupCoach;
