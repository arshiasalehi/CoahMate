import React, { useEffect, useState } from 'react';
import { auth, db } from '../DB/firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import '../App.css';

const DucClient = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setDocuments(data.documents || []); 
        }
      }
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="doc-client">
      <h2>Your Documents</h2>
      {documents.length > 0 ? (
        <ul>
          {documents.map((document, index) => (
            <li key={index}>
              {/* Display the properties of each document */}
              <h4>Document Index: {index}</h4>
              <p>coach id: {document.coachId}</p>
              <p>Description: {document.description}</p>
              <p>date: {document.date}</p>
              <p>time: {document.time}</p>
              <p>price: {document.price}</p>
              
              
                
              {/* Add more fields as necessary */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No documents received from your coach.</p>
      )}
    </div>
  );
};

export default DucClient;