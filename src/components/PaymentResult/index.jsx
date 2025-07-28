import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import lottie from 'lottie-web';
import { useAuth } from '../../context/AuthContext';
import { useStockContext } from '../../context/StockContext';

const formatIndianRupee = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

const getISTDate = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 19).replace('T', ' ');
};

const PaymentResult = () => {
  const { authData, userDetails, fetchUserTransactions } = useAuth();
  const { packages, fetchPackages } = useStockContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [transaction_id, setTransactionId] = useState(null);
  const [package_id, setPackageId] = useState(null);
  const [user_id, setUserId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [payment_date, setPaymentDate] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [dbUpdateError, setDbUpdateError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const animationRef = useRef(null);

  const userEmail = userDetails?.user_email_id;
  const userName = userDetails?.user_name;

  // Validate auth and user details
  if (!authData?.access_token || !userDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-600 text-center">Authentication error. Please log in again.</p>
        <button
          className="mt-4 px-6 py-2 text-lg text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
      </div>
    );
  }

  useEffect(() => {
    const packageId = searchParams.get('package_id');
    if (packageId) {
      setPackageId(packageId);
    } else {
      setApiError('Package ID is missing from URL parameters.');
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchFromStorage = async () => {
      try {
        const storedTransactionDetails = localStorage.getItem('transactionDetails');
        console.log('Stored transaction details:', storedTransactionDetails);
        if (storedTransactionDetails) {
          const parsedDetails = JSON.parse(storedTransactionDetails);
          setTransactionId(parsedDetails.transaction_id || null);
          setPackageId(parsedDetails.package_id || null);
          setUserId(parsedDetails.user_id || null);
          setAmount(parsedDetails.amount || null);
          setPaymentDate(parsedDetails.payment_date || null);
        } else {
          setApiError('No transaction details found in localStorage.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching transaction details from localStorage:', error.message);
        setApiError('Failed to load transaction details from localStorage.');
        setLoading(false);
      }
    };
    fetchFromStorage();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPaymentStatus = async () => {
      if (!transaction_id || !isMounted) {
        setApiError('Transaction ID is missing. Please initiate the payment again.');
        setLoading(false);
        return;
      }

      const isTokenValid = authData.access_token && authData.access_token_expiry > Math.floor(Date.now() / 1000);
      if (!isTokenValid) {
        setApiError('Authentication token is invalid or expired. Please log in again.');
        setLoading(false);
        return;
      }

      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000;
      let attempts = 0;

      while (attempts < MAX_RETRIES && isMounted) {
        try {
          console.log('Fetching payment status with:', { transaction_id, token: authData.access_token });
          setApiError(null);
          const response = await axios.get(`https://tradedge-server.onrender.com/api/paymentStatus`, {
            params: { transaction_id },
            headers: { Authorization: `Bearer ${authData.access_token}` },
            timeout: 10000, // 10-second timeout
          });

          console.log('API Response:', response.data);

          if (response.data && response.data.status) {
            const paymentData = response.data.status;
            const paymentState = paymentData.state || 'FAILURE';
            const paymentDetails = paymentData.paymentDetails?.[0] || {};

            setStatus(paymentState === 'COMPLETED' ? 'SUCCESS' : 'FAILURE');
            setTransactionDetails({
              transaction_id: paymentDetails.transactionId || transaction_id,
              payment_method: paymentDetails.paymentMode || 'PHONEPE',
              amount: paymentDetails.amount,
            });

            const updatedTransactionDetails = {
              transaction_id: paymentDetails.transactionId || transaction_id,
              package_id,
              user_id,
              amount: paymentDetails.amount || amount,
              payment_status: paymentState,
              payment_date: payment_date || getISTDate(),
              payment_method: paymentDetails.paymentMode || 'PHONEPE',
            };

            localStorage.setItem('transactionDetails', JSON.stringify(updatedTransactionDetails));

            await updateDB(paymentState, paymentDetails.paymentMode);
            await fetchUserTransactions(user_id);

            if (paymentState === 'COMPLETED' && package_id && userEmail && userName) {
              const packageData = await fetchPackageDetails(package_id);
              if (packageData && isMounted) {
                await sendConfirmationEmail({
                  email: userEmail,
                  name: userName,
                  transaction_id: paymentDetails.transactionId || transaction_id,
                  payment_method: paymentDetails.paymentMode || 'PHONEPE',
                  amount: Number(paymentDetails.amount || amount),
                  packageDetails: packageData,
                });
              }
            }
            setLoading(false);
            return;
          } else {
            throw new Error('Invalid response format from payment status API');
          }
        } catch (error) {
          attempts++;
          const errorMsg = error.response
            ? `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : error.request
            ? 'No response received from server.'
            : error.message;
          console.error(`Attempt ${attempts} failed:`, errorMsg);
          if (attempts === MAX_RETRIES) {
            if (isMounted) {
              setStatus('FAILURE');
              setApiError(`Failed to fetch payment status: ${errorMsg}`);
              setLoading(false);
            }
            return;
          }
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
        }
      }
    };

    fetchPaymentStatus();
    return () => {
      isMounted = false;
    };
  }, [transaction_id, package_id, user_id, amount, payment_date, userDetails, fetchUserTransactions, authData, userEmail, userName]);

  const updateDB = async (paymentState, payment_method) => {
    try {
      setDbUpdateError(null);
      const response = await axios.post(
        `https://tradedge-server.onrender.com/api/addPaymentindb`,
        {
          package_id,
          user_id,
          amount,
          payment_status: paymentState,
          payment_date: payment_date || getISTDate(),
          transaction_id,
          payment_method: payment_method || 'PHONEPE',
        },
        {
          headers: { Authorization: `Bearer ${authData.access_token}` },
          timeout: 10000,
        }
      );
      console.log('Payment status updated in DB:', response.data);
    } catch (error) {
      const errorMsg = error.response
        ? `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        : error.request
        ? 'No response received from server.'
        : error.message;
      setDbUpdateError(`Error updating payment status: ${errorMsg}`);
      console.error(errorMsg);
    }
  };

  const fetchPackageDetails = async (id) => {
    const url = `https://gateway.twmresearchalert.com/package?package_id=${id}`;
    console.log('Fetching package from URL:', url);
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${authData.access_token || '6WeFqncZXmLCo2V0/NaWIQ=='}` },
        timeout: 10000,
      });
      const packageData = response?.data?.data;
      if (packageData?.subtypes?.length > 0) {
        packageData.subtype = packageData.subtypes[0];
      }
      return packageData;
    } catch (error) {
      const errorMsg = error.response
        ? `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        : error.request
        ? 'No response received from server.'
        : error.message;
      console.error('Failed to fetch package details:', errorMsg);
      setApiError('Failed to fetch package details.');
      return null;
    }
  };

  const sendConfirmationEmail = async ({ email, name, transaction_id, payment_method, amount, packageDetails }) => {
    try {
      const response = await axios.post(
        'http://gateway.twmresearchalert.com?url=sendpackagemail',
        {
          email,
          name,
          transaction_id,
          payment_method,
          amount,
          packageDetails,
        },
        {
          headers: { Authorization: `Bearer ${authData.access_token}` },
          timeout: 10000,
        }
      );
      console.log('Full email response:', response.data);
      if (response.data.success) {
        console.log('Confirmation email sent');
      } else {
        console.warn('Email not sent:', response.data.message || 'No message returned from backend');
      }
    } catch (error) {
      const errorMsg = error.response
        ? `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
        : error.request
        ? 'No response received from server.'
        : error.message;
      console.error('Error sending confirmation email:', errorMsg);
      setApiError('Failed to send confirmation email.');
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

  useEffect(() => {
    if (showAnimation && animationRef.current) {
      try {
        lottie.loadAnimation({
          container: animationRef.current,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: 'https://assets4.lottiefiles.com/packages/lf20_k4xghwkb.json',
        });
      } catch (error) {
        console.error('Error loading Lottie animation:', error.message);
      }
    }
    return () => {
      if (animationRef.current) {
        lottie.destroy();
      }
    };
  }, [showAnimation, animationKey]);

  if (loading || status === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-lg text-gray-700">Fetching payment status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-full h-48 flex justify-center items-end">
          {showAnimation && (
            <div className="w-80 h-36" ref={animationRef}></div>
          )}
        </div>
        <h2
          className={`text-2xl font-semibold text-center mb-4 ${
            status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status === 'SUCCESS' ? 'Transaction Successful!' : 'Transaction Failed'}
        </h2>
        <div
          className={`w-full max-w-md p-6 rounded-2xl shadow-lg border-2 transition-all duration-500 ${
            status === 'SUCCESS' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
          }`}
        >
          <h3
            className={`text-xl font-bold text-center mb-4 ${
              status === 'SUCCESS' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {status === 'SUCCESS' ? 'Payment Successful!' : 'Payment Failed'}
          </h3>
          {status === 'SUCCESS' ? (
            <>
              <p className="text-gray-800 text-center mb-2">
                Transaction ID: <span className="font-semibold">{transactionDetails?.transaction_id || 'N/A'}</span>
              </p>
              <p className="text-gray-800 text-center mb-2">
                Payment Mode: <span className="font-semibold">{transactionDetails?.payment_method || 'N/A'}</span>
              </p>
              <p className="text-gray-800 text-center">
                Amount:{' '}
                <span className="font-semibold">
                  {transactionDetails?.amount ? formatIndianRupee(Number(transactionDetails.amount) / 100) : 'N/A'}
                </span>
              </p>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-700">Please try again or contact support.</p>
              <button
                className="mt-4 px-6 py-2 text-lg text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => navigate('/payment')}
              >
                Retry Payment
              </button>
            </div>
          )}
          {dbUpdateError && (
            <p className="text-red-600 text-center mt-3">{dbUpdateError}</p>
          )}
          {apiError && (
            <p className="text-red-600 text-center mt-3">{apiError}</p>
          )}
        </div>
        <button
          className="mt-8 px-6 py-2 text-lg text-gray-700 bg-gray-200 border border-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          onClick={() => navigate('/home')}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default PaymentResult;