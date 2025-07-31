import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdInfo, MdStar, MdCheckCircle, MdTrendingUp } from 'react-icons/md';
import { motion } from 'framer-motion';

const iconMap = {
  info: MdInfo,
  star: MdStar,
  'check-circle': MdCheckCircle,
  trending: MdTrendingUp,
};

const TradeCard = ({ item }) => {
  const navigate = useNavigate();
  const Icon = iconMap[item.icon] || MdInfo;

  const handleTradePress = () => {
    navigate(`/Tradedetails?package_id=${item.package_id}`);
  };

  const displayPrice = item.price && !isNaN(Number(item.price))
    ? new Intl.NumberFormat('en-IN').format(Number(item.price))
    : 'N/A';

  return (
    <div
      onClick={handleTradePress}
      className="min-w-[140px] max-w-[280px] min-h-[200px] p-2 rounded-xl shadow-md bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer sm:min-w-[180px] md:min-w-[200px] lg:min-w-[250px]"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-l sm:text-sm text-gray-900 truncate w-3/4 md:text-base">{item.title}</h2>
        <Icon className="text-gray-700 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </div>

      {/* Card Background */}
      <div className="relative h-[80%] flex flex-col items-center justify-center gap-2 bg-white rounded-lg overflow-hidden">
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-200 to-blue-400 opacity-20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />

        {/* Price */}
        <div className="z-10 text-center">
          <p className="text-lg sm:text-xl font-bold text-white bg-green-600 px-4 py-2 rounded-lg md:text-2xl">
            ₹ {displayPrice}/-
          </p>
        </div>

        {/* Subscribe */}
        <div className="z-10">
          <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 px-4 py-2 rounded-3xl border border-yellow-700 text-white font-bold text-sm sm:text-base md:text-lg">
            Subscribe
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeCard;