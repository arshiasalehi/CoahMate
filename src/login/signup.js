import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../DB/firebase';
import '../App.css';

const SignUp = () => {
  const [userType, setUserType] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [wallet, setWallet] = useState(0); 
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
    setError('');  

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        userid: user.uid,
        email: user.email,
        name, 
        wallet: parseInt(wallet, 10), 
        role: userType,
        age: age || null,
        weight: weight || null,
        height: height || null,
        address: address || '',
        description: description || '',
        documents: [],
        schedule: []
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      await sendEmailVerification(user);

      alert('Signup successful! A verification email has been sent.');
      window.location.reload();
    } catch (err) {
      setError(err.message); 
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
