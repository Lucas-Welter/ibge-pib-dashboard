import { useState, useEffect, useCallback } from 'react';

type UseResponsiveOptions = {
  breakpoint?: number;
  onBreakpointChange?: (isMobile: boolean) => void;
};

export function useResponsive({
  breakpoint = 640,
  onBreakpointChange
}: UseResponsiveOptions = {}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  const [showFullView, setShowFullView] = useState(false);

  // Toggle callback
  const toggleFullView = useCallback(() => {
    setShowFullView(prev => {
      console.log('Toggling full view:', !prev);
      return !prev;
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < breakpoint;

      // Only update if there's an actual change in mobile status
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);

        // Reset to mobile view only when switching from desktop to mobile
        if (newIsMobile && !isMobile) {
          setShowFullView(false);
        }

        // Call the callback if provided
        if (onBreakpointChange) {
          onBreakpointChange(newIsMobile);
        }
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, breakpoint, onBreakpointChange]);

  return {
    isMobile,
    showFullView,
    setShowFullView,
    toggleFullView
  };
}