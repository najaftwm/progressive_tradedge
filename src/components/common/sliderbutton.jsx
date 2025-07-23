// components/SliderButton.jsx
import React, { useState, useRef } from 'react';

const SliderButton = ({ onComplete }) => {
  const [isSliding, setIsSliding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const sliderRef = useRef(null);

  const handleMouseDown = () => setIsSliding(true);
  const handleMouseUp = (e) => {
    if (!sliderRef.current) return;
    const sliderWidth = sliderRef.current.offsetWidth;
    const mouseX = e.clientX - sliderRef.current.getBoundingClientRect().left;

    if (mouseX > sliderWidth * 0.85) {
      setCompleted(true);
      onComplete?.();
    }

    setIsSliding(false);
  };

  return (
    <div
      ref={sliderRef}
      onMouseUp={handleMouseUp}
      className="relative w-full max-w-sm h-14 bg-gray-200 rounded-full overflow-hidden shadow-md select-none"
    >
      <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-semibold">
        {completed ? 'Subscribed' : 'Slide to Subscribe'}
      </div>
      {!completed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute left-0 top-0 h-full w-14 bg-green-600 rounded-full cursor-pointer transition-all duration-300 hover:bg-green-700 active:scale-95"
        >
          <div className="h-full w-full flex items-center justify-center text-white font-bold">
            →
          </div>
        </div>
      )}
    </div>
  );
};

export default SliderButton;
