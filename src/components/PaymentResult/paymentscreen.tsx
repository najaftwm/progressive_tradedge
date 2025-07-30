import React, { useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { ArrowLeft } from 'lucide-react';
 // adjust path based on component location

const PaymentScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract query parameters
  const packageTitle = searchParams.get('packageTitle') || 'Package';
  const amount = searchParams.get('amount') || '0';
  const paymentLink = searchParams.get('paymentLink') || '';

  // Animation setup using Tailwind classes
  const buttonRef = useRef(null);
  const qrRef = useRef(null);

  useEffect(() => {
    if (qrRef.current) {
      // Apply initial scale and transition
      qrRef.current.classList.add('scale-75');
      setTimeout(() => {
        qrRef.current.classList.remove('scale-75');
        qrRef.current.classList.add('scale-100');
      }, 100);
    }
  }, []);

  const handleUPIPayment = () => {
    try {
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        alert('No UPI payment link provided.');
      }
    } catch (error) {
      console.error('Error opening UPI app:', error);
      alert('Failed to open UPI app. Please try again.');
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r  bg-gray-500 pt-10 text-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-black bg-opacity-10 hover:bg-opacity-20 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <p className="text-xl font-bold text-center flex-1 text-white">
          Payment for {packageTitle}
        </p>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center space-y-6">
        {/* Amount Card */}
        <div className="w-full max-w-md p-4 ">
          <p className="text-2xl font-bold text-center text-white">
            Amount: ₹{Number(amount).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Pay with UPI Button */}
        <div
        ref={buttonRef}
        className="w-full max-w-md transform transition-transform hover:scale-105"
      >
        <button
          onClick={handleUPIPayment}
          className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <div className="bg-white rounded-full p-1 shadow-md">
            <img
              src="/upi.png"
              alt="UPI Payment"
              className="w-10 h-10 object-contain"
            />
          </div>
          <span className="text-lg">Pay with UPI App</span>
        </button>
      </div>


        {/* OR Separator with Lines */}
        <div className="w-full max-w-md flex items-center justify-center">
          <div className="flex-1 h-0.5 bg-green-500"></div>
          <span className="px-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            OR
          </span>
          <div className="flex-1 h-0.5 bg-green-500"></div>
        </div>

        {/* QR Code */}
        <div
          ref={qrRef}
          className="w-full max-w-md p-6 rounded-xl shadow-md border border-green-500 bg-white transition-transform duration-400 ease-in-out"
        >
          <div className="flex justify-center">
            <QRCode
              value={paymentLink}
              size={220}
              bgColor="#fff"
              fgColor="#000"
            />
          </div>
          <p className="mt-4 text-base font-medium text-center text-black">
            Scan this QR code with a UPI app to pay
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;