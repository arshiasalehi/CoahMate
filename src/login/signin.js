import React, {  useState} from 'react';
import { getDoc, doc, getAuth, getFirestore } from '../DB/firebase'; 
import { reload, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../DB/firebase';
import '../App.css';

const Signin = ({ onClose, onSwitchToForgot }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData ] = useState(null);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess(false); 

    if (!email || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      
     const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserData(userData); 
        setSuccess(true);

        onClose(); 
      } else {
        console.log("No such document!");
      }
      
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email. Please check your email or sign up.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message); 
      }
    }
  };

  return (
    <div>
      <h1>welcom back</h1>
      <form onSubmit={handleSubmit}>
        <br />
        <label htmlFor="email">Username:</label>
        <input
          type="text"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Login</button>
        <br />
        {error && <div style={{ color: 'red' }}>{error}</div>} 
        {success && <div style={{ color: 'green' }}>Login successful!</div>} 

        <a href="#" onClick={() => onSwitchToForgot(email)}>Forgot Password?</a> 
      </form>
    </div>
  );
};

export default Signin;