import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const AnimatedLinkButton = ({
  onPress,
  title,
  icon: IconComponent = ArrowRight,
  iconSize = 20,
  className = '',
  showShimmer = false,
}) => {
  const controls = useAnimation();

  const handlePressIn = () => {
    controls.start({
      scale: 0.95,
      x: 5,
      transition: { type: 'spring', stiffness: 300, damping: 15 },
    });
  };

  const handlePressOut = () => {
    controls.start({
      scale: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 15 },
    });
  };

  return (
    <button
      onClick={onPress}
      onMouseDown={handlePressIn}
      onMouseUp={handlePressOut}
      onMouseLeave={handlePressOut}
      className={`relative overflow-hidden rounded-lg bg-green-600 text-white font-semibold py-2.5 px-4 flex items-center justify-center transition-all ${className}`}
    >
      <motion.div
        animate={controls}
        className="flex items-center justify-center z-10"
      >
        <span className="mr-2">{title}</span>
        <IconComponent size={iconSize} className="text-white" />
      </motion.div>

      {showShimmer && (
        <motion.div
          className="absolute w-16 h-full bg-white/20 top-0 left-0 rotate-45"
          animate={{ x: ['-100%', '200%'] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear',
          }}
        />
      )}
    </button>
  );
};

export default AnimatedLinkButton;
