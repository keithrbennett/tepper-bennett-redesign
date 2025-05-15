/**
 * Centralized scroll settings for Tepper & Bennett site
 * All scrolling behavior should reference this file to maintain consistency
 */

// Export a configuration object with all scroll-related settings
const SCROLL_SETTINGS = {
  // Core scrolling behavior - set to 'auto' for instant scrolling or 'smooth' for animated
  behavior: 'auto',
  
  // Scroll offset for headers (in pixels)
  headerOffset: -10,
  
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
    
    // Direct, immediate scrolling without any animation
    element.scrollIntoView({
      behavior: SCROLL_SETTINGS.behavior,
      block: 'start'
    });
    
    // Apply header offset if needed, also immediately
    if (SCROLL_SETTINGS.headerOffset !== 0) {
      window.scrollBy({
        top: SCROLL_SETTINGS.headerOffset,
        behavior: SCROLL_SETTINGS.behavior
      });
    }
  },
  
  // Scroll to top with consistent behavior
  scrollToTop: function() {
    // Direct, immediate scrolling to top
    window.scrollTo({
      top: 0,
      behavior: SCROLL_SETTINGS.behavior
    });
  }
}; 