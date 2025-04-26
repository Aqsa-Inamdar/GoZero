import { useState, TouchEvent, MouseEvent } from "react";

interface UseSwipeParams {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number; // minimum distance required for a swipe
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 100 }: UseSwipeParams) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // The required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = threshold;
  
  const onTouchStart = (e: TouchEvent | MouseEvent) => {
    if ('touches' in e) {
      setTouchEnd(null); // Reset touchEnd
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchEnd(null);
      setTouchStart(e.clientX);
      
      // Add mouse move and up listeners
      document.addEventListener('mousemove', onTouchMove as any);
      document.addEventListener('mouseup', onTouchEnd as any);
    }
  };
  
  const onTouchMove = (e: TouchEvent | MouseEvent) => {
    if ('touches' in e) {
      setTouchEnd(e.targetTouches[0].clientX);
    } else {
      setTouchEnd(e.clientX);
    }
  };
  
  const onTouchEnd = (e: TouchEvent | MouseEvent) => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }
    
    // Clean up mouse events
    if (!('touches' in e)) {
      document.removeEventListener('mousemove', onTouchMove as any);
      document.removeEventListener('mouseup', onTouchEnd as any);
    }
    
    // Reset values
    setTouchEnd(null);
    setTouchStart(null);
  };
  
  const bind = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown: onTouchStart,
  };
  
  return {
    bind,
    touchStart,
    touchEnd,
  };
}
