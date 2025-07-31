import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExplorePackageCard = ({ item }) => {
  const navigate = useNavigate();
  const [pressed, setPressed] = useState(false);
  const scaleRef = useRef(1);
  const shimmerRef = useRef(0);

  // Press animation using CSS transform
  useEffect(() => {
    let animationFrame;
    const animate = to => {
      let scale = scaleRef.current;
      scale += (to - scale) * 0.15;
      scaleRef.current = scale;
      if (Math.abs(to - scale) > 0.01) {
        animationFrame = requestAnimationFrame(() => animate(to));
      } else {
        scaleRef.current = to;
      }
    };
    pressed ? animate(1.06) : animate(1);
    return () => cancelAnimationFrame(animationFrame);
  }, [pressed]);

  // Shimmer animation simulation
  useEffect(() => {
    let animationFrame;
    const animateShimmer = () => {
      shimmerRef.current = (shimmerRef.current + 5) % 400;
      animationFrame = requestAnimationFrame(animateShimmer);
    };
    animateShimmer();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleTradePress = () => {
    navigate(`/Tradedetails?package_id=${item.package_id}`);
  };
  // Constants for display (you can adapt these to your data)
  const title = item.title ?? 'Stock Option Basic';
  const icon = item.icon ?? '₹';
  const mrp = item.mrp || 22500;
  const price = item.price || 1999;

  return (
    <div
      onClick={handleTradePress}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{ transform: `scale(${scaleRef.current})` }}
      className="min-w-[220px] max-w-[400px] min-h-[220px] rounded-xl shadow-lg bg-black hover:shadow-xl border border-gray-800 cursor-pointer relative overflow-hidden transition-transform duration-100"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-800">
        <span className="font-bold text-xl text-white">{title}</span>
      </div>
      
      {/* Feature list */}
      <div className="px-6 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 text-white text-base font-medium">
          <Check size={20} className="text-lime-400" />
          Daily
        </div>
        <div className="flex items-center gap-3 text-white text-base font-medium">
          <Check size={20} className="text-lime-400" />
          Profit margin 80%
        </div>
      </div>

      {/* Footer with price */}
      <div className="border-t border-gray-800 px-6 py-3 bg-black/95 flex justify-between items-center relative">
        <div
          className="absolute top-0 left-0 w-2/3 h-full pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 40%, transparent 100%)",
            transform: `translateX(${shimmerRef.current - 160}px) skewX(-10deg)`,
            zIndex: 1,
            filter: "blur(1.5px)",
          }}
        />
        <div className="flex items-center gap-3 z-20">
          <span className="text-gray-400 text-base line-through">₹{Number(mrp).toLocaleString('en-IN')}</span>
          <span className="bg-gradient-to-b from-lime-600 to-lime-400 rounded-md px-4 py-2 text-base font-bold text-white shadow">
            ₹{Number(price).toLocaleString('en-IN')}/-
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExplorePackageCard;