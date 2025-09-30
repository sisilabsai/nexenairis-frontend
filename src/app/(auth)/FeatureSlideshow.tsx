'use client';

import React, { useState, useEffect } from 'react';
import './auth.css';

const features = [
  "Advanced Financial Management",
  "Seamless Inventory Control",
  "Comprehensive HR and Payroll",
  "Efficient Project Management",
  "Insightful Business Analytics",
  "Robust CRM and Sales Tracking"
];

const FeatureSlideshow = () => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
        setFade(true);
      }, 500); // Corresponds to the fade-out duration
    }, 3000); // Change feature every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="feature-slideshow-container">
      <div className={`feature-slideshow-item ${fade ? 'fade-in' : 'fade-out'}`}>
        <p>{features[currentFeatureIndex]}</p>
      </div>
    </div>
  );
};

export default FeatureSlideshow;
