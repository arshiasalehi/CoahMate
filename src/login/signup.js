import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../DB/firebase';
import '../App.css';

const SignUp = () => {
  const [userType, setUserType] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // New state for name
  const [wallet, setWallet] = useState(0); // New state for wallet
  const [height, setheight] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [description, setDescription] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error state before attempting sign-up

    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Prepare user data to be stored in Firestore
      const userData = {
        userid: user.uid,
        email: user.email,
        name, // Add name
        wallet: parseInt(wallet, 10), // Add wallet (ensure it's an integer)
        role: userType,
        age: age || null,
        weight: weight || null,
        height: height || null,
        address: address || '',
        description: description || '',
        documents: [], // Array to store documents sent by coach
        schedule: [] // Map to store the user's schedule
      };

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), userData);

      // Send email verification
      await sendEmailVerification(user);

      alert('Signup successful! A verification email has been sent.');
      window.location.reload(); // Optionally redirect or refresh the page

    } catch (err) {
      setError(err.message); // Set error message for display
    }
  };

  return (
    <div>
      <h1>Level Up Your Game Today!</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="userType">I am a:</label>
        <select id="userType" value={userType} onChange={(e) => setUserType(e.target.value)}>
          <option value="client">Client</option>
          <option value="coach">Coach</option>
        </select>
        <br />
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <small>Password must be at least 6 characters, including uppercase, lowercase, and a number.</small>
        <br />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
