import React, { useEffect, useState } from 'react';
import { auth, db } from '../DB/firebase';
import { collection, getDoc, doc, updateDoc, arrayRemove, arrayUnion, getDocs } from 'firebase/firestore';
import '../App.css';

const ConnectClient = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [clientWallet, setClientWallet] = useState(0);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const coachesCollection = collection(db, 'users');
        const coachSnapshot = await getDocs(coachesCollection);

        const coachList = coachSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => user.role === 'coach');

        console.log(coachList);
        setCoaches(coachList);
      } catch (error) {
        console.error("Error fetching coaches: ", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchClientWallet = async () => {
      if (auth.currentUser) {
        const clientRef = doc(db, 'users', auth.currentUser.uid);
        const clientSnapshot = await getDoc(clientRef);
        if (clientSnapshot.exists()) {
          const clientData = clientSnapshot.data();
          setClientWallet(clientData.wallet || 0);
        }
      }
    };

    fetchCoaches();
    fetchClientWallet();
  }, []);

  const handleTimeSlotChange = (coachId, timeSlot) => {
    setSelectedTimeSlot({ coachId, timeSlot });
  };

  const handleChooseCoach = async (coachId) => {
    if (!selectedTimeSlot || selectedTimeSlot.coachId !== coachId) {
      alert("Please select an available time slot.");
      return;
    }

    const { date, time, description, price } = selectedTimeSlot.timeSlot;

    if (clientWallet < price) {
      alert("Please add money to your wallet.");
      return;
    }

    if (auth.currentUser) {
      const clientRef = doc(db, 'users', auth.currentUser.uid);
      const coachRef = doc(db, 'users', coachId);

      try {
        const coachSnapshot = await getDoc(coachRef);
        if (!coachSnapshot.exists()) {
          throw new Error("Coach does not exist.");
        }

        const coachData = coachSnapshot.data();
        const coachWallet = coachData.wallet || 0;

        await updateDoc(clientRef, {
          schedule: arrayUnion({
            date,
            time,
            description,
            coachId,
            coachName: selectedTimeSlot.timeSlot.coachName || "Unknown Coach",
          }),
          selectedCoach: coachId,
          wallet: clientWallet - price,
          documents: arrayUnion({
            date,
            time,
            description,
            coachId,
            coachName: selectedTimeSlot.timeSlot.coachName || "Unknown Coach",
            price: Number(price),
            transactionType: 'Booking',
          }),
        });

        await updateDoc(coachRef, {
          wallet: coachWallet + price,
          schedule: arrayRemove(selectedTimeSlot.timeSlot),
          documents: arrayUnion({
            date,
            time,
            description,
            clientId: auth.currentUser.uid,
            clientName: auth.currentUser.displayName || "Unknown Client",
            price: Number(price),
            transactionType: 'Booking',
          }),
        });

        alert("You have successfully booked the coach!");
        setSelectedTimeSlot(null);
        setClientWallet(clientWallet - price);
      } catch (error) {
        console.error("Error booking coach: ", error.message);
        alert("There was an issue booking the coach. Please try again.");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="connect-client">
      <h2>Choose Your Coach</h2>
      <div className="coaches-list">
        {coaches.length > 0 ? (
          coaches.map((coach) => (
            <div key={coach.id} className="coach-box">
              <img
                src={coach.fileURL}
                alt={`${coach.name}'s Profile`}
                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
              />
              <h3>{coach.name}</h3>
              <p>{coach.description}</p>
              <h4>Availability:</h4>
              {coach.schedule && coach.schedule.length > 0 ? (
                <div>
                  {coach.schedule.map((timeSlot, index) => (
                    <div key={index}>
                      <input
                        type="radio"
                        id={`${coach.id}-${index}`}
                        name={`schedule-${coach.id}`}
                        value={index}
                        onChange={() => handleTimeSlotChange(coach.id, timeSlot)}
                        checked={
                          selectedTimeSlot &&
                          selectedTimeSlot.coachId === coach.id &&
                          selectedTimeSlot.timeSlot === timeSlot
                        }
                      />
                      <label htmlFor={`${coach.id}-${index}`}>
                        {timeSlot.date} - {timeSlot.time}: {timeSlot.description} - {timeSlot.price}$
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Not Available</p>
              )}
              <button onClick={() => handleChooseCoach(coach.id)}>
                Choose this Coach
              </button>
            </div>
          ))
        ) : (
          <p>No coaches available.</p>
        )}
      </div>
    </div>
  );
};

export default ConnectClient;
