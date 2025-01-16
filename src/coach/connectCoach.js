import React, { useEffect, useState } from 'react';
import { db } from '../DB/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import '../App.css';

const Coachconnect = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsCollection = collection(db, 'users');  
        const q = query(clientsCollection, where("role", "==", "client")); 
        const clientSnapshot = await getDocs(q);
        
        const clientList = clientSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log(clientList);

        setClients(clientList);
      } catch (error) {
        console.error("Error fetching clients: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);




  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="connect-client">
      <div className="clients-list">
        {clients.length > 0 ? (
          clients.map((client) => (
            <div key={client.id} className="client-box">
              <img
                src={client.fileURL} 
                alt={`${client.name}'s Profile`}
                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
              />
              <h3>{client.name}</h3>
              <p>Email: {client.email}</p>
              <p>goal: {client.description}</p>
              <p>Age: {client.age}</p>
              <p>Weight: {client.weight}</p>
              <p>Height: {client.height}</p>
            </div>
          ))
        ) : (
          <p>No clients available.</p>
        )}
      </div>

    </div>
  );
};

export default Coachconnect;
