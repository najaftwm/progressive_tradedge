import React, { useEffect, useRef } from 'react';

const AnimatedButton = ({
  onPress,
  title,
  icon,
  style = {},
  gradient = false,
  gradientColors = ['#04810E', '#039D74'],
  variant = 'primary',
  pulseAnimation = false,
}) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (pulseAnimation && nodeRef.current) {
      nodeRef.current.classList.add('animate-pulse');
    }
    return () => {
      if (nodeRef.current) {
        nodeRef.current.classList.remove('animate-pulse');
      }
    };
  }, [pulseAnimation]);

  const handleClick = () => {
    if (typeof onPress === 'function') {
      onPress();
    }
  };

  const baseClasses =
    'flex items-center justify-center px-4 py-2.5 rounded-lg shadow-md transition-transform duration-200';

  const variantClasses =
    variant === 'secondary'
      ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      : 'bg-green-600 text-white dark:bg-green-700';

  const gradientStyle = gradient
    ? {
        backgroundImage: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`,
        color: 'white',
      }
    : {};

  return (
    <button
      ref={nodeRef}
      onClick={handleClick}
      style={{ ...gradientStyle, ...style }}
      className={`${baseClasses} ${variantClasses} ${pulseAnimation ? 'animate-pulse' : ''}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span className="text-sm font-semibold">{title}</span>
    </button>
  );
};

export default AnimatedButton;
