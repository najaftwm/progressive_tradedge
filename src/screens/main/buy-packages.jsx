import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { MdArrowBack, MdExpandMore, MdExpandLess } from 'react-icons/md';
import moment from 'moment';

const PackagesScreen = () => {
  const navigate = useNavigate();
  const { userTransactions } = useContext(AuthContext); //  FIXED HERE
  const [expanded, setExpanded] = useState(true);

  console.log('🧾 userTransactions:', JSON.stringify(userTransactions, null, 2));
  console.log(
    '📦 Purchased Package IDs:',
    (userTransactions || []).map((txn) => txn.package_details?.subtype_id)
  );

  const getPackageTransactions = () => {
    if (!userTransactions || userTransactions.length === 0) return [];

    return userTransactions
      .filter(
        (txn) =>
          txn.package_details?.subtype_name &&
          txn.package_details?.subtype_id &&
          Array.isArray(txn.payment_history)
      )
      .flatMap((item) =>
        item.payment_history.map((payment) => ({
          ...payment,
          package_id: String(item.package_details.subtype_id),
          packageName: item.package_details.subtype_name,
          packagePrice: item.package_details.package_price ?? '0',
          purchaseDate: item.purchase_info?.purchase_date ?? '',
          expiryDate: item.purchase_info?.expiry_date ?? '',
          type: 'package',
        }))
      );
  };

  const packageTransactions = getPackageTransactions();

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD MMM YYYY') : 'N/A';
  };

  return (
    <div className="flex-1 bg-gray-100 p-4 min-h-screen">
      {/* Header */}
      <div className="flex flex-row items-center mb-4">
        <MdArrowBack
          size={28}
          color="#007AFF"
          className="mr-2 cursor-pointer"
          onClick={() => navigate('/profile')}
        />
        <span className="text-xl font-bold text-blue-600 flex-1">Browse Purchased Packages</span>
      </div>

      {/* Toggle */}
      <div
        className="flex flex-row justify-between items-center p-3.5 rounded-xl bg-gray-200 shadow-md mb-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-base font-bold text-blue-600">Browse Purchased Packages</span>
        {expanded ? (
          <MdExpandLess size={26} color="#4B5563" />
        ) : (
          <MdExpandMore size={26} color="#4B5563" />
        )}
      </div>

      {expanded &&
        (packageTransactions.length > 0 ? (
          <ul className="space-y-3">
            {packageTransactions.map((item, index) => (
              <li key={index}>
                <div
                  className="bg-white rounded-xl p-4 border border-gray-300 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => {
                    if (!item.package_id) {
                      console.warn(' Invalid package_id');
                      return;
                    }
                    navigate({
                      pathname: '/TradeDetails',
                      search: `?package_id=${item.package_id}&package_name=${item.packageName}&package_price=${item.packagePrice}&payment_date=${item.payment_date}`,
                    });
                  }}
                >
                  <span className="text-lg font-bold text-blue-600">{item.packageName}</span>
                  <p className="text-sm text-gray-700 mt-1">Price: ₹{item.packagePrice}</p>
                  <p className="text-sm text-gray-700 mt-1">Paid on: {formatDate(item.purchaseDate)}</p>
                  <p className="text-sm text-gray-700 mt-1">Valid till: {formatDate(item.expiryDate)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center mt-10 text-base">No purchased packages found.</p>
        ))}
    </div>
  );
};

export default PackagesScreen;
