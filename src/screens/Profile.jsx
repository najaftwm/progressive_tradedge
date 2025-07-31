import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import KycComponent from '../components/Login/KycComponent';

const Profile = () => {
  const { authData, userDetails, userTransactions, userDetailsLoading, transactionsLoading, userDetailsError, transactionsError, kycStatus } = useContext(AuthContext);
  const navigate = useNavigate();

  // Calculate user stats from userTransactions
  const getUserStats = () => {
    let invested = 0;
    let trades = 0;

    userTransactions.forEach((txn) => {
      txn.payment_history?.forEach((payment) => {
        invested += parseFloat(payment.amount ?? '0');
        trades += 1;
      });
    });

    return { invested, trades };
  };

  const isKycVerified = kycStatus === 'Y' || authData?.auth === 'Y';
  const isKycNotVerified = kycStatus === 'N';
  const isKycNotApplied = !isKycVerified && !isKycNotVerified; // Neither verified nor not verified (e.g., null, undefined, or other)
  const { invested, trades } = getUserStats();

  const ProfileItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between border-b py-3">
      <div className="flex items-center space-x-3">
        <div className="bg-gray-100 p-2 rounded-full">
          <Icon size={20} className="text-gray-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-medium text-black">{value || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );

  // Handle loading and error states
  if (userDetailsLoading || transactionsLoading) {
    return <div className="min-h-screen bg-gray-50 pt-20 text-center text-gray-600">Loading...</div>;
  }

  if (userDetailsError || transactionsError) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 text-center text-red-600">
        Error loading profile data. Please try again later.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white px-6 py-8 rounded-b-3xl shadow-md">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-3 rounded-full shadow-md">
            <User size={32} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {userDetails?.user_full_name || authData?.user_name || 'User'}
            </h2>
            <p className="text-sm">Active Trader</p>
          </div>
        </div>
        <div className="mt-6 flex justify-around bg-white/10 p-4 rounded-xl text-white text-center">
          <div>
            <p className="text-lg font-bold">₹{invested.toLocaleString()}</p>
            <p className="text-sm">Portfolio</p>
          </div>
          <div className="border-l border-white h-10" />
          <div>
            <p className="text-lg font-bold">{trades}</p>
            <p className="text-sm">Trades</p>
          </div>
        </div>
      </div>

      

      {/* Personal Info */}
      <div className="mt-6 bg-white shadow rounded-xl mx-4 p-4">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <ProfileItem icon={User} label="Full Name" value={userDetails?.user_full_name || 'Not provided'} />
        <ProfileItem icon={Mail} label="Email" value={authData?.user_email_id || 'Not provided'} />
        <ProfileItem icon={Phone} label="Phone" value={userDetails?.username || authData?.user_name || 'Not provided'} />
      </div>

      {/* KYC Status Message */}
      <div className="mt-6 mx-4 space-y-4">
        {isKycVerified && (
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-xl shadow-md flex items-center space-x-3">
            <CheckCircle size={24} className="text-white" />
            <div>
              <p className="text-lg font-semibold">KYC Verified</p>
              <p className="text-sm">Your identity has been successfully verified!</p>
            </div>
          </div>
        )}
        {isKycNotVerified && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl shadow-md flex items-center space-x-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="text-lg font-semibold">KYC Not Verified</p>
              <p className="text-sm">Your KYC submission was not approved. Please try again.</p>
            </div>
          </div>
        )}
        {isKycNotApplied && (
          <div className="bg-gray-100 border border-gray-200 text-gray-600 p-4 rounded-xl shadow-md flex items-center space-x-3">
            <AlertCircle size={24} className="text-gray-600" />
            <div>
              <p className="text-lg font-semibold">KYC Not Applied</p>
              <p className="text-sm">Please complete your KYC to access all features.</p>
            </div>
          </div>
        )}
      </div>

      {/* Render KYC component if KYC is NOT applied */}
      {isKycNotApplied && (
        <div className="mt-6 mx-4">
          <KycComponent />
        </div>
      )}

      {/* Transaction History + Packages */}
      <div className="mt-6 bg-white shadow rounded-xl mx-4 p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Transactions & Packages</h3>
        <button
          onClick={() => navigate('/transactions-history')}
          className="w-full bg-green-500 hover:bg-green-600 text-center py-3 rounded-lg flex items-center justify-between px-4"
        >
          Transaction History <ChevronRight size={20} />
        </button>
        <button
          onClick={() => navigate('/user_package')}
          className="w-full bg-green-500 hover:bg-green-600 text-center py-3 rounded-lg flex items-center justify-between px-4"
        >
          My Packages <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Profile;