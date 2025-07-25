import React from 'react';

const TransactionItem = ({ item }) => {
  // Format payment date
  const formattedDate = item.payment_date
    ? new Date(item.payment_date.replace(' ', 'T')).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  // Determine if amount is credit or debit
  const isCredit = Number(item.amount) > 0;

  // Generate avatar
  const avatarInitial = item.packageName ? item.packageName.charAt(0).toUpperCase() : '?';
  const avatarColor = `#${(item.packageName ? item.packageName.length * 123 : 0)
    .toString(16)
    .slice(0, 6)
    .padEnd(6, '0')}`;

  // Format amount
  const formattedAmount = `₹${Number(item.amount).toLocaleString('en-IN')}`;

  // Get status label and color
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('success'))
      return <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">Success</span>;
    if (s.includes('fail'))
      return <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded">Failed</span>;
    if (s.includes('pend'))
      return <span className="text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded">Pending</span>;
    return <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-0.5 rounded">Unknown</span>;
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
      {/* Avatar circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0"
        style={{ backgroundColor: avatarColor }}
      >
        <span className="text-white font-bold text-lg">{avatarInitial}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="text-base font-medium text-gray-800 truncate">
            {item.packageName || 'Unknown Package'}
          </div>
          <div
            className={`text-base font-semibold ${
              isCredit ? 'text-green-600' : 'text-red-500'
            } ml-4 shrink-0`}
          >
            {isCredit ? `+ ${formattedAmount}` : `- ${formattedAmount}`}
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-sm text-gray-500">{formattedDate}</div>
          <div className="ml-2">{getStatusBadge(item.status)}</div>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
