import React, { useState } from 'react';

const PhoneInput = ({ phone, setPhone, phoneError, handleSubmit, otpButtonLoading }) => {
  const [consentGiven, setConsentGiven] = useState(false);

  const handlePhoneChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setPhone(numericValue);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex w-3/4 sm:w-2/3 bg-white rounded-lg mb-2 h-12 items-center shadow-md">
        <div className="w-16 h-full bg-gray-100 flex justify-center items-center rounded-l-lg border-r border-gray-300">
          <span className="text-gray-700 text-base">+91</span>
        </div>
        <input
          type="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="Enter Phone Number"
          maxLength={10}
          className="flex-1 p-3 text-black text-base focus:outline-none"
          disabled={otpButtonLoading}
        />
      </div>
      {phoneError && phoneError !== ' ' && (
        <p className="text-red-500 text-sm mb-2 text-center w-full">{phoneError}</p>
      )}
      <div className="flex items-center mb-2 w-3/4 sm:w-2/3 px-2">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={() => setConsentGiven(!consentGiven)}
          className="w-5 h-5 text-white border-white rounded focus:ring-0"
        />
        <p className="text-white text-xs sm:text-sm ml-2 flex-1">
          By Proceeding I accept all the{' '}
          <span className="text-green-500 underline">terms and conditions</span> of Tradedge
        </p>
      </div>
      <button
        onClick={handleSubmit}
        disabled={otpButtonLoading || !consentGiven || phone.length !== 10}
        className="bg-black text-white px-8 py-3 rounded-lg shadow-md hover:bg-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {otpButtonLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          'Get OTP'
        )}
      </button>
      <p className="text-white text-xs sm:text-sm mt-2">
        Verified by <span className="font-bold">1 lakh+</span> customers
      </p>
    </div>
  );
};

export default PhoneInput;