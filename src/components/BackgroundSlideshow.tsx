import React, { useState, useEffect } from 'react';

// Define the background images for the slideshow
const backgroundImages = [
  '/images/background1.jpg',
  '/images/background2.jpg',
  '/images/background3.jpg',
  '/images/background4.jpg',
  '/images/background5.jpg'
];

interface BackgroundSlideshowProps {
  interval?: number; // Time between slides in ms
  opacity?: number; // Opacity of the background images
  children?: React.ReactNode;
}

const BackgroundSlideshow: React.FC<BackgroundSlideshowProps> = ({
  interval = 5000,
  opacity = 0.15,
  children
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Set up the slideshow interval
    const slideInterval = setInterval(() => {
      // Start the transition
      setIsTransitioning(true);
      
      // After the transition is complete, update the current image
      setTimeout(() => {
        setCurrentImageIndex(nextImageIndex);
        setNextImageIndex((nextImageIndex + 1) % backgroundImages.length);
        setIsTransitioning(false);
      }, 1000); // Transition time
    }, interval);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(slideInterval);
  }, [interval, nextImageIndex]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  };
  
  const backgroundImageStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'opacity 1s ease-in-out',
    zIndex: -1,
  };
  
  const currentImageStyle: React.CSSProperties = {
    ...backgroundImageStyle,
    backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
    opacity: isTransitioning ? 0 : opacity,
    zIndex: -2,
  };
  
  const nextImageStyle: React.CSSProperties = {
    ...backgroundImageStyle,
    backgroundImage: `url(${backgroundImages[nextImageIndex]})`,
    opacity: isTransitioning ? opacity : 0,
    zIndex: -1,
  };
  
  const contentContainerStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
    height: '100%'
  };

  return (
    <div style={containerStyle} className="background-slideshow-container">
      {/* Current background image */}
      <div
        className={`background-image current ${isTransitioning ? 'fade-out' : ''}`}
        style={currentImageStyle}
      />
      
      {/* Next background image (fades in during transition) */}
      <div
        className={`background-image next ${isTransitioning ? 'fade-in' : ''}`}
        style={nextImageStyle}
      />
      
      {/* Content container */}
      <div style={contentContainerStyle} className="content-container">
        {children}
      </div>
    </div>
  );
};

export default BackgroundSlideshow;
