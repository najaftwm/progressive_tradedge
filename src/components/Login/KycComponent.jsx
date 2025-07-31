import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const sendKycconfirmationmail = async (email, status) => {
  try {
    const res = await fetch('http://gateway.twmresearchalert.com?url=sendkycmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        type: 'kyc',
        status,
      }),
    });

    const data = await res.json();
    console.log(" Response from PHP:", data);
  } catch (err) {
    console.error(` Error sending KYC ${status} email:`, err.message || err);
  }
};

const KycComponent = ({ onKycComplete }) => {
  const {
    authData,
    fetchKycStatus,
  } = useContext(AuthContext);

  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [message, setMessage] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const resolveEmail = () =>
    authData?.user_email_id || JSON.parse(localStorage.getItem('authData'))?.user_email_id || null;

  const resolveKycStatus = async () => {
    if (kycStatus) return kycStatus;
    if (authData?.auth === 'Y') return 'Y';
    if (authData?.auth === 'N') return 'N';
    return await fetchKycStatus();
  };

  useEffect(() => {
    const fetchStatusAndMaybeSendMail = async () => {
      try {
        const status = await resolveKycStatus();
        setKycStatus(status);

        const email = resolveEmail();

        console.log("📧 Checking if email should be sent:", {
          email: email || 'Not available',
          userId: authData?.user_id || null,
          status,
          emailSent,
        });

        if (!email || emailSent) return;

        if (status === 'Y') {
          console.log(" Sending verified KYC mail to:", email);
          await sendKycconfirmationmail(email, 'verified');
          setEmailSent(true);
        }
      } catch (err) {
        setMessage(' Failed to fetch KYC or send email');
        console.error(err);
      }
    };

    fetchStatusAndMaybeSendMail();
  }, [authData, fetchKycStatus, emailSent]);

  useEffect(() => {
    if (message) setTimeout(() => setMessage(null), 5000);
  }, [message]);

  const handleUpload = async () => {
    if (!aadhaarFile || !panFile) {
      setMessage('Upload Aadhaar & PAN');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('aadhar', aadhaarFile);
      formData.append('pan', panFile);
      formData.append('user_id', authData.user_id);

      const res = await fetch('https://gateway.twmresearchalert.com/kyc', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authData.access_token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      setMessage('Submitted for review');
      onKycComplete?.();
      setExpanded(false);
      setAadhaarFile(null);
      setPanFile(null);
    } catch (err) {
      setMessage(err.message || 'KYC submission failed');
    } finally {
      setUploading(false);
    }
  };

  if (kycStatus === 'Y') {
    return <p className="p-4 bg-green-100 text-green-700 rounded"> Verified</p>;
  }

  if (kycStatus === 'N' && (authData?.aadhar_name || authData?.pan_name)) {
    return <p className="p-4 bg-red-100 text-red-700 rounded"> Unverified – contact support</p>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {!expanded ? (
        <div className="bg-white rounded-xl shadow p-4 border-2 border-green-500">
          <div className="flex items-start gap-2">
            <div className="text-green-600 text-2xl"></div>
            <div>
              <p className="text-green-700 font-bold text-lg">KYC Required</p>
              <p className="text-sm text-gray-700">Verify your identity to unlock all features.</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="mt-4 w-full bg-green-600 text-white font-semibold py-2 rounded-lg"
          >
            Complete KYC Now
          </button>
        </div>
      ) : (
        <div className="bg-black text-white rounded-xl shadow p-4">
          <button onClick={() => setExpanded(false)} className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="white">
              <path fillRule="evenodd" d="M12.293 16.293a1 1 0 01-1.414 0L5.586 11l5.293-5.293a1 1 0 011.414 1.414L8.414 11l3.879 3.879a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>

          <p className="text-lg font-semibold mb-2">Complete Your KYC</p>
          <p className="text-sm mb-4">Please upload clear images of your Aadhaar Card and PAN Card for verification.</p>

          {[{ label: 'Aadhaar Card', file: aadhaarFile, setter: setAadhaarFile },
            { label: 'PAN Card', file: panFile, setter: setPanFile }].map(({ label, file, setter }) => (
            <div key={label} className="mb-4">
              <p className="font-semibold mb-1">{label}</p>
              <label className="w-full bg-green-600 text-white flex items-center justify-center py-2 rounded cursor-pointer">
                Upload Image
                <input type="file" accept="image/*" onChange={e => setter(e.target.files[0])} className="hidden" />
              </label>
              {file && <p className="text-xs mt-1 text-gray-400">{file.name}</p>}
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full py-2 mt-2 rounded text-white ${uploading ? 'bg-gray-400' : 'bg-green-500'}`}
          >
            {uploading ? 'Uploading...' : 'Submit KYC'}
          </button>
          {message && <p className="mt-3 text-sm text-center text-red-400">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default KycComponent;
