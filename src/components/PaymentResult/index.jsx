import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import lottie from 'lottie-web';
import { CheckCircle, XCircle } from 'lucide-react';

const PaymentResult = () => {
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState(null);
  const [packageId, setPackageId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [paymentDate, setPaymentDate] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [dbUpdateError, setDbUpdateError] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const queryPackageId = params.get('package_id');

  // Simulate useUser context with localStorage
  const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
  const userEmail = userDetails.user_email_id;
  const userName = userDetails.user_full_name;

  const formatIndianRupee = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100); // Adjust for paise to rupees
  };

  const getISTDate = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate = new Date(now.getTime() + istOffset);
    return istDate.toISOString().slice(0, 19).replace('T', ' ');
  };

  useEffect(() => {
    if (queryPackageId) setPackageId(queryPackageId);
  }, [queryPackageId]);

  useEffect(() => {
    const fetchFromStorage = async () => {
      try {
        const storedTransactionDetails = localStorage.getItem('transactionDetails');
        if (storedTransactionDetails) {
          const parsedDetails = JSON.parse(storedTransactionDetails);
          setTransactionId(parsedDetails.transaction_id || null);
          setPackageId(parsedDetails.package_id || null);
          setUserId(parsedDetails.user_id || null);
          setAmount(parsedDetails.amount || null);
          setPaymentDate(parsedDetails.payment_date || null);
        }
      } catch (error) {
        console.error('Error fetching transaction details from localStorage:', error.message);
      }
    };
    fetchFromStorage();
  }, []);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!transactionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://tradedge-server.onrender.com/api/paymentStatus`, {
          params: { transaction_id: transactionId },
        });

        const paymentData = response.data.status || {};
        const paymentState = paymentData.state || 'FAILURE';
        const paymentDetails = paymentData.paymentDetails?.[0] || {};

        setStatus(paymentState === 'COMPLETED' ? 'SUCCESS' : 'FAILURE');
        setTransactionDetails({
          transaction_id: paymentDetails.transactionId,
          payment_method: paymentDetails.paymentMode,
          amount: paymentDetails.amount,
        });

        const updatedTransactionDetails = {
          transaction_id: paymentDetails.transactionId || transactionId,
          package_id: packageId,
          user_id: userId,
          amount: paymentDetails.amount || amount,
          payment_status: paymentState,
          payment_date: paymentDate || getISTDate(),
          payment_method: paymentDetails.paymentMode || 'PHONEPE',
        };

        localStorage.setItem('transactionDetails', JSON.stringify(updatedTransactionDetails));
        await updateDB(paymentState, paymentDetails.paymentMode);

        if (paymentState === 'COMPLETED' && packageId && userEmail && userName) {
          const packageData = await fetchPackageDetails(packageId);
          if (packageData) {
            await sendConfirmationEmail({
              email: userEmail,
              name: userName,
              transaction_id: paymentDetails.transactionId || transactionId,
              payment_method: paymentDetails.paymentMode || 'PHONEPE',
              amount: Number(paymentDetails.amount || amount),
              packageDetails: packageData,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching payment status:', error.message);
        setStatus('FAILURE');
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentStatus();
  }, [transactionId]);

  const updateDB = async (paymentState, paymentMethod) => {
    try {
      setDbUpdateError(null);
      const response = await axios.post(`https://tradedge-server.onrender.com/api/addPaymentindb`, {
        package_id: packageId,
        user_id: userId,
        amount: amount,
        payment_status: paymentState,
        payment_date: paymentDate || getISTDate(),
        transaction_id: transactionId,
        payment_method: paymentMethod || 'PHONEPE',
      });
      console.log('Payment status updated in DB:', response.data);
    } catch (error) {
      const errorMsg = `Error updating payment status: ${error.response?.status} - ${JSON.stringify(error.response?.data) || error.message}`;
      setDbUpdateError(errorMsg);
      console.error(errorMsg);
    }
  };

  useEffect(() => {
    if (status === 'SUCCESS') {
      setShowAnimation(true);
      setAnimationKey(prev => prev + 1);
      const timer = setTimeout(() => setShowAnimation(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchPackageDetails = async (id) => {
    const url = `https://gateway.twmresearchalert.com/package?package_id=${id}`;
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `6WeFqncZXmLCo2V0/NaWIQ==` },
      });
      const packageData = response?.data?.data;
      if (packageData?.subtypes?.length > 0) packageData.subtype = packageData.subtypes[0];
      return packageData;
    } catch (error) {
      console.error('Failed to fetch package details:', error.response?.status, error.message);
      return null;
    }
  };

  const sendConfirmationEmail = async ({ email, name, transaction_id, payment_method, amount, packageDetails }) => {
    try {
      const response = await axios.post('http://gateway.twmresearchalert.com?url=sendpackagemail', {
        email, name, transaction_id, payment_method, amount, packageDetails,
      });
      if (response.data.success) console.log('Confirmation email sent');
      else console.warn('Email not sent:', response.data.message || 'No message returned');
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  useEffect(() => {
    if (showAnimation) {
      const anim = lottie.loadAnimation({
        container: document.getElementById('confetti-animation'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: '/confetti-burst.json', // Ensure this file is hosted or adjust path
      });
      anim.addEventListener('complete', () => anim.destroy());
      return () => anim.destroy();
    }
  }, [showAnimation, animationKey]);

  if (loading || status === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-700 dark:text-gray-300">Fetching payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-[320px] flex flex-col items-center">
        {/* Confetti animation */}
        <div className="w-full h-[190px] flex items-end justify-center">
          {showAnimation && (
            <div id="confetti-animation" className="w-[320px] h-[180px]"></div>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-green-600 dark:text-green-400 text-center mb-4 mt-2">
          Transaction Successful!
        </h1>
        <div className="w-full flex justify-center">
          <div
            className={`w-[320px] p-7 rounded-xl border-2 ${
              status === 'SUCCESS'
                ? 'bg-green-100 border-green-400 dark:bg-green-900 dark:border-green-600'
                : 'bg-red-50 border-red-400 dark:bg-red-900 dark:border-red-600'
            } shadow-lg`}
          >
            <h2
              className={`text-xl font-semibold text-center mb-4 ${
                status === 'SUCCESS' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}
            >
              {status === 'SUCCESS' ? 'Payment Successful!' : 'Payment Failed'}
              {status === 'SUCCESS' ? <CheckCircle className="inline ml-2" /> : <XCircle className="inline ml-2" />}
            </h2>
            {status === 'SUCCESS' ? (
              <>
                <p className="text-base text-gray-800 dark:text-gray-200 text-center mb-2">
                  Transaction ID: <span className="font-bold">{transactionDetails?.transaction_id}</span>
                </p>
                <p className="text-base text-gray-800 dark:text-gray-200 text-center mb-2">
                  Payment Mode: <span className="font-bold">{transactionDetails?.payment_method}</span>
                </p>
                <p className="text-base text-gray-800 dark:text-gray-200 text-center">
                  Amount: <span className="font-bold">{transactionDetails?.amount ? formatIndianRupee(Number(transactionDetails.amount)) : 'N/A'}</span>
                </p>
              </>
            ) : (
              <p className="text-base text-gray-700 dark:text-gray-300 text-center">Please try again.</p>
            )}
            {dbUpdateError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-4 text-center">{dbUpdateError}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="mt-8 px-6 py-2 text-lg font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-400 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default PaymentResult;