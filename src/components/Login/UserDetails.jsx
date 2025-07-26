import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDetails = ({
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  referrerCode,
  setReferrerCode,
  onSubmit,
  continueButtonLoading,
  userDetailsError,
  phoneNumber,
  setPhone,
}) => {
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [whatsAppSent, setWhatsAppSent] = useState(false);

  const navigate = useNavigate();

  // Notify user (simulating ToastAndroid/Alert for web)
  const notifyUser = (message) => {
    alert(message); // Consider using react-toastify for a better UX
  };

  // Validate name (at least 3 characters)
  const validateName = (userName) => {
    return userName.trim().length > 2;
  };

  // Validate email (regex)
  const validateEmail = (userEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(userEmail);
  };

  // WhatsApp notification
  const sendWelcomeWhatsAppMessage = async () => {
    console.log('📨 Preparing to send welcome WhatsApp message...');

    try {
      const whatsAppUrl = 'https://app2.cunnekt.com/v1/sendnotification';
      const api_key = process.env.REACT_APP_WHATSAPP_API_KEY || '3115c6ff026625317b9df24d692570ecab70ffb1';

      const payload = {
        mobile: `91${phoneNumber}`,
        templateid: '1207184657851670',
        overridebot: 'no',
        parameters: { userName },
      };

      const response = await fetch(whatsAppUrl, {
        method: 'POST',
        headers: {
          'API-KEY': api_key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('new user WhatsApp API Response:', result);

      if (response.ok) {
        notifyUser(`Welcome to Tradedge! WhatsApp confirmation sent to ${phoneNumber}.`);
        return true;
      } else {
        console.error('❌ WhatsApp error:', result);
        notifyUser('Failed to send WhatsApp confirmation.');
        return false;
      }
    } catch (error) {
      console.error('❌ WhatsApp Exception:', error);
      notifyUser('Error sending WhatsApp confirmation.');
      return false;
    }
  };

  // Check if form is valid
  const isFormValid = validateName(userName) && validateEmail(userEmail);

  // Handle form submission
  const handleFormSubmit = async () => {
    setNameError('');
    setEmailError('');
    let isValid = true;

    if (!validateName(userName)) {
      setNameError('Name must be at least 3 characters');
      setTimeout(() => setNameError(''), 5000);
      isValid = false;
    }

    if (!validateEmail(userEmail)) {
      setEmailError('Please enter a valid email address');
      setTimeout(() => setEmailError(''), 5000);
      isValid = false;
    }

    if (isValid) {
      try {
        console.log('Calling onSubmit...');
        const success = await onSubmit(); // Trigger submission logic
        console.log('onSubmit result:', success);
        if (success) {
          // Send WhatsApp message only once
          if (!whatsAppSent) {
            const sent = await sendWelcomeWhatsAppMessage();
            console.log('WhatsApp sent:', sent);
            if (sent) setWhatsAppSent(true);
          } else {
            console.log('ℹ️ WhatsApp already sent.');
          }
          // Redirect to OTP login
          console.log('Navigating to /otp-login...');
          navigate('/otp-login');
        } else {
          console.log('onSubmit returned false, not navigating.');
        }
      } catch (error) {
        console.error('Error in handleFormSubmit:', error);
        notifyUser('An error occurred during submission.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full font-kanchenjunga">
      {/* Name Input */}
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Enter Your Name"
        className="w-full bg-white rounded-lg mb-1 h-12 text-base text-black px-4 font-kanchenjunga placeholder-gray-400 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
        disabled={continueButtonLoading}
      />
      <p className="text-red-500 text-sm mb-1 text-center w-full font-bold">{nameError || ' '}</p>

      {/* Email Input */}
      <input
        type="email"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        placeholder="Enter Your Email"
        className="w-full bg-white rounded-lg mb-1 h-12 text-base text-black px-4 font-kanchenjunga placeholder-gray-400 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
        disabled={continueButtonLoading}
      />
      <p className="text-red-500 text-sm mb-1 text-center w-full font-bold">{emailError || ' '}</p>

      {/* Phone Number Input */}
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter Your Phone Number"
        className="w-full bg-white rounded-lg mb-1 h-12 text-base text-black px-4 font-kanchenjunga placeholder-gray-400 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
        disabled={continueButtonLoading}
      />
      <p className="text-red-500 text-sm mb-1 text-center w-full font-bold">{' '}</p>

      {/* Referrer Code Input */}
      <input
        type="text"
        value={referrerCode}
        onChange={(e) => setReferrerCode(e.target.value)}
        placeholder="Enter Referral Code (Optional)"
        className="w-full bg-white rounded-lg mb-1 h-12 text-base text-black px-4 font-kanchenjunga placeholder-gray-400 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
        disabled={continueButtonLoading}
      />
      <p className="text-red-500 text-sm mb-1 text-center w-full font-bold">{' '}</p>

      {/* User Details Error */}
      {userDetailsError && userDetailsError.trim() !== '' && (
        <p className="text-red-500 text-sm mb-1 text-center w-full font-bold">{userDetailsError}</p>
      )}

      {/* Continue Button */}
      <button
        onClick={handleFormSubmit}
        disabled={continueButtonLoading || !isFormValid}
        className={`w-48 rounded-lg py-3 px-4 text-white text-lg font-bold font-kanchenjunga shadow-md ${
          isFormValid ? 'bg-black hover:bg-gray-800' : 'bg-gray-500 cursor-not-allowed'
        } disabled:opacity-50 flex items-center justify-center`}
      >
        {continueButtonLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  );
};

export default UserDetails;