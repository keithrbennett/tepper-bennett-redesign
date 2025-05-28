/**
 * Centralized scroll settings for Tepper & Bennett site
 * All scrolling behavior should reference this file to maintain consistency
 */

// Export a configuration object with all scroll-related settings
const SCROLL_SETTINGS = {
  // Core scrolling behavior - set to 'auto' for instant scrolling or 'smooth' for animated
  behavior: 'auto',
  
  // Scroll offset for headers (in pixels)
  headerOffset: 0,
  
  // Timeout durations (in milliseconds)
  timeouts: {
    scrollDelay: 0,      // Delay before scrolling (0 for immediate)
    throttleDelay: 0     // Throttle delay for scroll events (0 for no throttling)
  }
};

// Utility functions for scrolling that use the central settings
const ScrollUtils = {
  // Scroll to element with consistent behavior
  scrollToElement: function(element) {
    if (!element) return;
    
    // Use smooth scrolling for better user experience
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    // Apply header offset if needed, with a small delay to let the scroll start
    if (SCROLL_SETTINGS.headerOffset !== 0) {
      setTimeout(() => {
        window.scrollBy({
          top: SCROLL_SETTINGS.headerOffset,
          behavior: 'smooth'
        });
      }, 100);
    }
  },
  
  // Scroll to top with consistent behavior
  scrollToTop: function() {
    // Direct, immediate scrolling to top
    window.scrollTo({
      top: 0,
      behavior: SCROLL_SETTINGS.behavior
    });
  },

  // Helper function to scroll to an element after section expansion
  // This consolidates the repeated pattern from section-handler.js and data-loader.js
  scrollAfterExpansion: function(triggerElement, delay) {
    const scrollDelay = delay || window.tbConfig?.animation?.shortDurationMs || 300;
    setTimeout(() => {
      const sectionContainer = triggerElement.closest('.section-container');
      const targetElement = sectionContainer || triggerElement;
      
      if (typeof ScrollUtils !== 'undefined' && ScrollUtils.scrollToElement) {
        ScrollUtils.scrollToElement(targetElement);
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, scrollDelay + 100);
  }
}; 