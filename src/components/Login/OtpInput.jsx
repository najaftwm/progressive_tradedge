import React, { useRef, useState } from 'react';

const OtpInput = ({
  otpDigits,
  setOtpDigits,
  setOtp,
  otpError,
  handleOtpSubmit,
  handleResendOtp,
  timer,
  isResendEnabled,
  verifyOtpButtonLoading,
  phoneNumber,
  userName
}) => {
  const inputRefs = useRef([]);
  const [whatsAppSent, setWhatsAppSent] = useState(false);

  const notifyUser = (message) => {
    alert(message); // Web equivalent of ToastAndroid/Alert
  };

  const handleOtpChange = (text, index) => {
    if (text.length > 1) return;
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = text;
    setOtpDigits(newOtpDigits);
    setOtp(newOtpDigits.join(''));
    if (text && index < otpDigits.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    handleResendOtp();
    setWhatsAppSent(false);
  };

  const sendOtpSuccessWhatsAppMessage = async () => {
    console.log("whatsapp is set ready");
    try {
      const api_key = import.meta.env.VITE_WHATSAPP_API_KEY || '3115c6ff026625317b9df24d692570ecab70ffb1';
      const messagePayload = {
        mobile: `91${phoneNumber}`,
        templateid: '1207184657851670',
        overridebot: 'no',
        parameters: { userName }
      };
      const response = await fetch('https://app2.cunnekt.com/v1/sendnotification', {
        method: 'POST',
        headers: {
          'API-KEY': api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      });
      const result = await response.json();
      console.log("📦 WhatsApp API Response:", result);
      if (response.ok) {
        return true;
      } else {
        console.error('❌ WhatsApp message failed:', result);
        return false;
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    const success = await handleOtpSubmit(otp);
    console.log('✅ OTP Verification Result:', success);
    if (success) {
      console.log("✅ OTP verified successfully.");
      if (!whatsAppSent) {
        const sent = await sendOtpSuccessWhatsAppMessage();
        console.log("📨 WhatsApp message sent?", sent);
        if (sent) {
          setWhatsAppSent(true);
        }
      } else {
        console.log("ℹ️ WhatsApp message already sent.");
      }
    } else {
      notifyUser('OTP verification failed. Please try again.');
      console.log("❌ OTP verification failed.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-4 mb-4 w-3/4 sm:w-1/2 justify-between">
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyPress(e, index)}
            maxLength={1}
            className="w-14 h-14 bg-white rounded-lg border border-gray-300 text-black text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
          />
        ))}
      </div>
      {otpError.trim() !== '' && (
        <p className="text-red-500 text-sm font-bold mb-2 text-center w-full">{otpError}</p>
      )}
      <button
        onClick={handleVerifyOtp}
        disabled={verifyOtpButtonLoading}
        className="bg-black text-white px-8 py-3 rounded-lg shadow-md hover:bg-gray-800 disabled:opacity-50"
      >
        {verifyOtpButtonLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          'Verify OTP'
        )}
      </button>
      <button
        onClick={handleResend}
        disabled={!isResendEnabled}
        className="mt-2 text-white text-base disabled:opacity-50 w-48 text-center"
      >
        Resend OTP {isResendEnabled ? '' : `in (${timer}s)`}
      </button>
    </div>
  );
};

export default OtpInput;