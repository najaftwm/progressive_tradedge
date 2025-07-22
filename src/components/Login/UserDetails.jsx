import React from 'react';

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
  setPhone
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Full Name"
        className="w-3/4 sm:w-2/3 p-3 mb-2 rounded-lg border border-gray-300 text-black text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="email"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        placeholder="Email"
        className="w-3/4 sm:w-2/3 p-3 mb-2 rounded-lg border border-gray-300 text-black text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={referrerCode}
        onChange={(e) => setReferrerCode(e.target.value)}
        placeholder="Referrer Code (Optional)"
        className="w-3/4 sm:w-2/3 p-3 mb-2 rounded-lg border border-gray-300 text-black text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {userDetailsError.trim() !== '' && (
        <p className="text-red-500 text-sm mb-2 text-center w-full">{userDetailsError}</p>
      )}
      <button
        onClick={onSubmit}
        disabled={continueButtonLoading}
        className="bg-black text-white px-8 py-3 rounded-lg shadow-md hover:bg-gray-800 disabled:opacity-50"
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