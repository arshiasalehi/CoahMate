import React, { useState, useEffect } from 'react';
import { auth } from '../DB/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import '../App.css';

const ForgotPassword = ({ email, onClose }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    setEmailInput(email);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');


    try {
      await sendPasswordResetEmail(auth, emailInput);
      setMessage('Check your inbox for further instructions to reset your password.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          required
        />
        <br />
        <button type="submit">Send Reset Link</button>
        <br />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {message && <div style={{ color: 'green' }}>{message}</div>}
      </form>
    </div>
  );
};

export default ForgotPassword;