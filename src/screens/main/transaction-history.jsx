import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MdArrowBack } from 'react-icons/md';
import TransactionHistory from '../components/TransactionHistory';

export default function TransactionHistoryPage() {
  const { userTransactions } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});


  console.log(userTransactions);

  // Flatten and enrich payments
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

  // Log for debugging
  useEffect(() => {
    console.log('📜 userTransactions:', userTransactions);
    console.log('📜 allPayments:', allPayments);
  }, [userTransactions]);

  // Group transactions by readable section
  const getSectionLabel = (dateStr) => {
    const date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Invalid date format:', dateStr);
      return 'Unknown Date';
    }
    const today = new Date();
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'Last Week';
    if (diffDays <= 31) return 'Last Month';
    return `${date.getFullYear()} ${date.toLocaleString('default', { month: 'long' })}`;
  };

  const grouped = {};
  allPayments.forEach((txn) => {
    const label = getSectionLabel(txn.payment_date);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(txn);
  });

  const sections = Object.entries(grouped).map(([label, data]) => ({
    title: label,
    data,
  }));

  // Auto-expand all sections when data is loaded
  useEffect(() => {
    const allExpanded = {};
    sections.forEach((s) => {
      allExpanded[s.title] = true;
    });
    setExpandedSections(allExpanded);
    console.log('📦 Grouped Sections:', sections);
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

      {/* Transaction History List */}
      <TransactionHistory
        sections={sections}
        expandedSections={expandedSections}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSection={toggleSection}
      />
    </div>
  );
}