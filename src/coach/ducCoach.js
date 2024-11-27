import React, { useEffect, useState } from 'react';
import { auth, db } from '../DB/firebase'; // Import your Firebase configuration
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../App.css';

const DucCoach = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setDocuments(data.documents || []); // Set documents from the coach's data
        }
      }
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  const handleRefund = async (document, index) => {
    if (!auth.currentUser) return;

    try {
      const coachRef = doc(db, 'users', auth.currentUser.uid);
      const clientRef = doc(db, 'users', document.clientId);

      // Fetch the coach's and client's data
      const coachDoc = await getDoc(coachRef);
      const clientDoc = await getDoc(clientRef);

      if (coachDoc.exists() && clientDoc.exists()) {
        const coachData = coachDoc.data();
        const clientData = clientDoc.data();

        // Update wallets
        const updatedCoachWallet = Number(coachData.wallet ) - Number(document.price);
        const updatedClientWallet = Number(clientData.wallet ) + Number(document.price);

        // Update time availability
        const updatedAvailability = [
          ...(coachData.availability || []),
          { date: document.date, time: document.time },
        ];

        // Update Firestore
        await updateDoc(coachRef, {
          wallet: updatedCoachWallet,
          availability: updatedAvailability,
          documents: documents.map((doc, i) =>
            i === index ? { ...doc, refunded: true } : doc
          ), // Mark this document as refunded
        });

        await updateDoc(clientRef, {
          wallet: updatedClientWallet,
        });

        // Update local state
        setDocuments((prev) =>
          prev.map((doc, i) =>
            i === index ? { ...doc, refunded: true } : doc
          )
        );

        alert('Refund processed successfully.');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('An error occurred while processing the refund.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="doc-coach">
      <h2>Your Documents</h2>
      {documents.length > 0 ? (
        <div className="documents-container">
          {documents.map((document, index) => (
            <div className="document-box" key={index}>
              <h4>Document #{index + 1}</h4>
              <p><strong>Client ID:</strong> {document.clientId}</p>
              <p><strong>Client Name:</strong> {document.clientName}</p>
              <p><strong>Description:</strong> {document.description}</p>
              <p><strong>Date:</strong> {document.date}</p>
              <p><strong>Time:</strong> {document.time}</p>
              <p><strong>Price:</strong> {document.price}</p>
              <p><strong>Transaction Type:</strong> {document.transactionType}</p>
              {document.refunded ? (
                <p style={{ color: 'green' }}>Refunded</p>
              ) : (
                <button
                  onClick={() => handleRefund(document, index)}
                  className="refund-button"
                >
                  Refund
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No documents received from your clients.</p>
      )}
    </div>
  );
};

export default DucCoach;
