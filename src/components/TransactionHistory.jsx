import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MdArrowBack } from 'react-icons/md';
import { IoSearch } from 'react-icons/io5';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import TransactionItem from './TransactionItem'; // Import the provided TransactionItem

export default function TransactionHistoryPage() {
  const { userTransactions } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  // Log userTransactions for debugging
  console.log('userTransactions:', userTransactions);

  // Process all payments
  const allPayments = userTransactions
    .flatMap((item) => {
      if (!item?.payment_history || !Array.isArray(item.payment_history)) {
        console.warn('⚠️ Invalid payment_history for item:', item);
        return [];
      }
      return item.payment_history.map((payment) => {
        if (!payment.payment_date) {
          console.warn('⚠️ Missing payment_date for payment:', payment);
        }
        return {
          ...payment,
          packageName: item.package_details?.subtype_name || 'Unknown Package',
          packagePrice: item.package_details?.package_price || '0',
          purchaseDate: item.purchase_info?.purchase_date || '',
          status: payment.payment_status || 'Unknown',
        };
      });
    })
    .filter((p) => p.payment_date && !isNaN(new Date(p.payment_date.replace(' ', 'T')).getTime()))
    .sort((a, b) => {
      const dateA = new Date(a.payment_date.replace(' ', 'T')).getTime();
      const dateB = new Date(b.payment_date.replace(' ', 'T')).getTime();
      return dateB - dateA;
    });

  // Section header rendering
  const renderSectionHeader = (section) => {
    const isExpanded = !!expandedSections[section.title];
    return (
      <div
        className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer rounded-md"
        onClick={() => toggleSection(section.title)}
      >
        <span className="text-lg font-bold text-gray-800 pl-2">
          {section.title}
        </span>
        {isExpanded ? (
          <MdKeyboardArrowUp size={24} className="text-gray-700" />
        ) : (
          <MdKeyboardArrowDown size={24} className="text-gray-700" />
        )}
      </div>
    );
  };

  const getSectionLabel = (date) => {
    const now = new Date('2025-07-25T14:59:00Z'); // Current date and time (02:59 PM IST, July 25, 2025)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'Last Week';
    if (diffDays <= 31) return 'Last Month';
    return `${date.getFullYear()} ${date.toLocaleString('default', { month: 'long' })}`;
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    const s = status.toLowerCase();
    if (s.includes('success')) return 'Success';
    if (s.includes('fail')) return 'Failed';
    if (s.includes('pend')) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Normalize the search query
  const normalizedQuery = (searchQuery || '').trim().toLowerCase();

  // Group and filter data
  let groupedPayments = {};
  allPayments.forEach((item) => {
    const date = new Date(item.payment_date.replace(' ', 'T'));
    if (!date || isNaN(date.getTime())) {
      console.warn('⚠️ Invalid or missing payment_date for item:', item);
      return;
    }
    const label = getSectionLabel(date);
    if (!groupedPayments[label]) groupedPayments[label] = [];
    groupedPayments[label].push(item);
  });

  const filteredSections = Object.keys(groupedPayments)
    .map((label) => ({
      title: label,
      data: groupedPayments[label].filter(
        (item) =>
          normalizedQuery === '' ||
          (item.packageName || '').toLowerCase().includes(normalizedQuery) ||
          (item.status || '').toLowerCase().includes(normalizedQuery)
      ),
    }))
    .filter((section) => section.data.length > 0);

  // Debug logs
  console.log('✅ Grouped Payments:', groupedPayments);
  console.log('🔍 Normalized Query:', normalizedQuery);
  console.log('✅ Filtered Sections:', filteredSections);

  // Auto-expand all sections when data is loaded
  useEffect(() => {
    const allExpanded = {};
    filteredSections.forEach((s) => {
      allExpanded[s.title] = true;
    });
    setExpandedSections(allExpanded);
  }, [userTransactions]);

  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  return (
    <div className="flex-1 bg-gray-100 pt-4.5 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-2.5">
        <MdArrowBack
          size={28}
          color="#007AFF"
          className="mr-2 cursor-pointer"
          onClick={() => navigate('/profile')}
        />
        <span className="text-2xl font-bold text-black flex-1">Transaction History</span>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 p-3 border rounded-md mb-6 bg-white shadow-sm">
        <IoSearch size={20} className="text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-1 outline-none text-sm text-gray-800"
          placeholder="Search transactions"
        />
      </div>

      {/* Sections */}
      {filteredSections.length === 0 ? (
        <div className="text-center text-gray-500 mt-4">No transactions found.</div>
      ) : (
        filteredSections.map((section) => (
          <div key={section.title} className="mb-4">
            {renderSectionHeader(section)}
            {expandedSections[section.title] && (
              <ul className="bg-white border mt-2 rounded-md overflow-hidden">
                {section.data.map((item, index) => (
                  <li key={item.payment_id?.toString() || `txn-${index}`} className="border-b last:border-0">
                    <TransactionItem item={item} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
}