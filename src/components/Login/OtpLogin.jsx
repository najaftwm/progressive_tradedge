import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PhoneInput from './PhoneInput';
import OtpInput from './OtpInput';
import UserDetails from './UserDetails';
import KycComponent from './KycComponent';

// API endpoints
const API_ENDPOINTS = {
  SESSION: 'https://kyclogin.twmresearchalert.com/session',
  KYC: 'https://gateway.twmresearchalert.com/kyc',
  WHATSAPP: 'https://app2.cunnekt.com/v1/sendnotification'
};

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const OtpLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [referrerCode, setReferrerCode] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [verificationId, setVerificationId] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [phoneError, setPhoneError] = useState(' ');
  const [otpError, setOtpError] = useState(' ');
  const [userDetailsError, setUserDetailsError] = useState(' ');
  const [otpButtonLoading, setOtpButtonLoading] = useState(false);
  const [continueButtonLoading, setContinueButtonLoading] = useState(false);
  const [verifyOtpButtonLoading, setVerifyOtpButtonLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showKyc, setShowKyc] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  useEffect(() => {
    if (showOtpField && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsResendEnabled(true);
    }
  }, [showOtpField, timer]);

  const handleError = (error, setError) => {
    console.error('Error:', error);
    let errorMessage = 'Something went wrong. Please try again.';
    if (error.response) {
      errorMessage = error.response.data?.messages?.[0] || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    setError(errorMessage);
    setTimeout(() => setError(' '), 5000);
  };

  const makeApiCall = async (apiCall, maxRetries = MAX_RETRIES) => {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        return await apiCall();
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
      }
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setPhoneError(' ');
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !indianPhoneRegex.test(phone)) {
      setPhoneError('Please enter a valid Indian phone number');
      setTimeout(() => setPhoneError(' '), 5000);
      return;
    }
    setIsLoading(true);
    setOtpButtonLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.SESSION}?number=${phone}`);
      if (response.status === 200) {
        const responseData = await response.json();
        if (responseData.data && responseData.messages && responseData.messages[0] === 'OTP Sent') {
          setVerificationId(responseData.data.verificationId);
          setShowOtpField(true);
        } else {
          handleError(responseData, setPhoneError);
        }
      } else if (response.status === 403) {
        setShowUserDetails(true);
      } else {
        const errorData = await response.json();
        handleError(errorData, setPhoneError);
      }
    } catch (error) {
      handleError(error, setPhoneError);
    } finally {
      setIsLoading(false);
      setOtpButtonLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    if (isLoading) return false;
    setOtpError(' ');
    if (otp.length !== 4) {
      setOtpError('Please enter a valid 4-digit OTP');
      setTimeout(() => setOtpError(' '), 5000);
      return false;
    }
    setIsLoading(true);
    setVerifyOtpButtonLoading(true);
    try {
      const response = await makeApiCall(() =>
        fetch(API_ENDPOINTS.SESSION, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: phone, otp, platform: 'web', verificationId })
        })
      );
      const data = await response.json();
      if (data.success && data.statusCode === 201) {
        login(data.data); // Store token and session data
        setRegistrationComplete(true);
        setShowKyc(true);
        return true;
      } else {
        throw new Error(data.messages?.[0] || 'OTP verification failed');
      }
    } catch (error) {
      handleError(error, setOtpError);
      return false;
    } finally {
      setIsLoading(false);
      setVerifyOtpButtonLoading(false);
    }
  };

  const handleResendOtp = () => {
    setShowOtpField(false);
    setOtp('');
    setOtpDigits(['', '', '', '']);
    setTimer(30);
    setIsResendEnabled(false);
    setPhoneError(' ');
  };

  const handleUserDetailsSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setContinueButtonLoading(true);
    setUserDetailsError(' ');
    const payload = {
      user_full_name: userName.trim(),
      user_whatsapp_number: phone.trim(),
      user_alternate_number: phone.trim(),
      user_email_id: userEmail.trim().toLowerCase(),
      user_position: 3,
      user_active: 'Y',
      ...(referrerCode && { referred_by: referrerCode.trim() }),
    };
    try {
      const response = await fetch(API_ENDPOINTS.KYC, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success && data.statusCode === 201) {
        login(data.data); // Store token and session data
        setRegistrationComplete(true);
        setShowKyc(true);
        setShowUserDetails(false);
      } else {
        setUserDetailsError(data.message || 'Failed to create user');
      }
    } catch (error) {
      setUserDetailsError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setContinueButtonLoading(false);
    }
  };

  const handleKycComplete = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SESSION}?number=${phone}`);
      const responseData = await response.json();
      if (response.status === 200 && responseData.data && responseData.messages && responseData.messages[0] === 'OTP Sent') {
        setVerificationId(responseData.data.verificationId);
        setShowOtpField(true);
        setShowKyc(false);
      } else {
        handleError(responseData, setUserDetailsError);
      }
    } catch (error) {
      handleError(error, setUserDetailsError);
    }
    navigate('/home'); // Navigate to home after KYC completion
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <div className="flex flex-col items-center pt-10">
        <img
          src="https://via.placeholder.com/150"
          alt="Tradedge Logo"
          className="w-32 h-32 mb-0"
        />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black sm:text-4xl">
            <span className="text-[#4666C8]">Hey</span> There!
          </h1>
          <h2 className="text-xl font-medium text-black sm:text-2xl">
            Welcome to <span className="font-bold text-[#4666C8]">Tradedge</span>
          </h2>
          <h2 className="text-xl font-medium text-black sm:text-2xl">
            Get <span className="font-bold text-[#4666C8]">3 Free</span> trades
          </h2>
        </div>
      </div>

      {showKyc ? (
        <div className="flex-1 w-full p-5 max-w-lg">
          <KycComponent onKycComplete={handleKycComplete} />
        </div>
      ) : (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#3828B2] to-[#4A6FE9] rounded-t-3xl p-5 transition-all duration-300 max-w-2xl mx-auto ${
            showUserDetails ? 'h-[50%]' : 'h-[38%]'
          } sm:h-[40%] md:h-[35%] ${isModalVisible ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="text-center">
            <h2 className="text-xl font-medium text-white sm:text-2xl">Let's Get Started</h2>
            <p className="text-white mb-4 text-sm sm:text-base">Follow Simple steps to get into Tradedge</p>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {showUserDetails ? (
            <UserDetails
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              referrerCode={referrerCode}
              setReferrerCode={setReferrerCode}
              onSubmit={handleUserDetailsSubmit}
              continueButtonLoading={continueButtonLoading}
              userDetailsError={userDetailsError}
              phoneNumber={phone}
              setPhone={setPhone}
            />
          ) : showOtpField ? (
            <OtpInput
              otpDigits={otpDigits}
              setOtpDigits={setOtpDigits}
              setOtp={setOtp}
              otpError={otpError}
              handleOtpSubmit={handleOtpSubmit}
              handleResendOtp={handleResendOtp}
              timer={timer}
              isResendEnabled={isResendEnabled}
              verifyOtpButtonLoading={verifyOtpButtonLoading}
              phoneNumber={phone}
              userName={userName}
            />
          ) : (
            <PhoneInput
              phone={phone}
              setPhone={setPhone}
              phoneError={phoneError}
              handleSubmit={handleSubmit}
              otpButtonLoading={otpButtonLoading}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default OtpLogin;