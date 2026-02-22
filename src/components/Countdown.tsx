import React, { useEffect, useState } from "react";

const Countdown = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<{ days?: number; hours?: number; minutes?: number; seconds?: number }>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <div className="flex justify-around">
      {['days', 'hours', 'minutes', 'seconds'].map((unit, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <svg className="absolute top-0 left-0" width="100%" height="100%">
              <circle cx="50%" cy="50%" r="40%" stroke="#e0e0e0" strokeWidth="10" fill="none" />
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                stroke="#4caf50"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${(timeLeft[unit] || 0) * 100 / (unit === 'days' ? 60 : unit === 'hours' ? 24 : unit === 'minutes' ? 60 : 60)} 100`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-black">
              {timeLeft[unit] || 0}
            </span>
          </div>
          <span className="text-lg font-semibold">{unit.charAt(0).toUpperCase() + unit.slice(1)}</span>
        </div>
      ))}
    </div>
  );
};

export default Countdown; 