/**
 * URL handler for Tepper & Bennett
 * Manages URL hash behavior and prevents unwanted auto-scrolling
 */

// CRITICAL: Add a style element to prevent any automatic scrolling
(function() {
  // Create a style element to lock the scroll position until we're ready
  const style = document.createElement('style');
  style.id = 'scroll-lock';
  style.textContent = `
    html, body {
      scroll-behavior: auto !important;
      overflow: hidden !important;
      height: 100% !important;
    }
  `;
  document.head.appendChild(style);
  
  // Store original hash if any
  if (window.location.hash) {
    sessionStorage.setItem('originalHash', window.location.hash);
    
    // If this appears to be a refresh, immediately clear the hash
    if (sessionStorage.getItem('pageLoaded') === 'true') {
      // Use replaceState to avoid creating a history entry
      if (history.replaceState) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      }
    }
  }
  
  // Set scroll restoration to manual
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  // Flag to track if we're handling the scroll ourselves
  window.urlHandlerControllingScroll = true;
})();

document.addEventListener('DOMContentLoaded', function() {
  // Set scroll restoration to manual immediately to prevent browser auto-scroll
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const isRefresh = sessionStorage.getItem('pageLoaded') === 'true';
  const originalHash = sessionStorage.getItem('originalHash');
  
  // Clear the scrollLock after a short delay to allow our scroll handling to happen first
  setTimeout(() => {
    const scrollLock = document.getElementById('scroll-lock');
    if (scrollLock) {
      scrollLock.remove();
    }
    
    // Force scroll to top immediately after removing scroll lock
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, 50);
  
  if (isRefresh) {
    console.log('Page refresh detected, preventing automatic scrolling');
    
    // Set flag that we're controlling scroll
    window.urlHandlerControllingScroll = true;
      
      // Remove the hash without causing a page jump
      if (history.replaceState) {
        // Modern browsers
        history.replaceState(null, null, window.location.pathname + window.location.search);
        
        // Force scroll to top of page - use multiple attempts with increasing force
        // Immediate scroll attempt
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        
        // Defer additional scroll attempts to ensure they happen after any browser auto-scroll
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
          
          // Use requestAnimationFrame to ensure we're scrolling after any rendering
          requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            
            // Final attempt with a longer delay
            setTimeout(() => {
              window.scrollTo(0, 0);
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
              console.log('Final scroll reset attempt');
            }, 300);
          });
        }, 100);
      } else {
        // Fallback for older browsers - this will cause a scroll to top
        window.location.hash = '';
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
      
      // Block other scroll handlers
      sessionStorage.setItem('blockOtherScrollHandlers', 'true');
    } else {
      // This is a direct link to a section, let the normal behavior happen
      console.log('Direct link to section detected, allowing auto-scroll');
      
      // Make sure the section is expanded if it's a collapsible section
      const sectionId = hash;
      const sectionHeading = document.getElementById(`${sectionId}-heading`);
      
      if (sectionHeading && sectionHeading.classList.contains('collapsible-toggle')) {
        if (sectionHeading.getAttribute('aria-expanded') === 'false') {
          // Simulate a click to expand the section
          setTimeout(() => {
            sectionHeading.click();
          }, 100);
        }
      }
    }
  }
  
  // Mark that the page has been loaded for future refresh detection
  sessionStorage.setItem('pageLoaded', 'true');
});

// Capture and prevent all hash changes
window.addEventListener('hashchange', function(e) {
  if (window.urlHandlerControllingScroll) {
    console.log('URL handler intercepting hash change event');
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
});

// Additional handler for the load event
window.addEventListener('load', function() {
  const isRefresh = sessionStorage.getItem('pageLoaded') === 'true';
  const originalHash = sessionStorage.getItem('originalHash');
  
  // This is the final handler in page load sequence
  console.log('Page fully loaded, final scroll position check');
  
  // Make sure any scroll lock is removed
  const scrollLock = document.getElementById('scroll-lock');
  if (scrollLock) {
    scrollLock.remove();
  }
  
  if (isRefresh) {
    window.urlHandlerControllingScroll = true;
    
    // Clear the hash one last time to be sure
    if (history.replaceState) {
      history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    
    // Override any scroll that might have happened using a stronger force
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    
    // Force to top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // Use a sequence of delayed attempts to overcome any browser auto-scroll
    const forceScrollToTop = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };
    
    // Multiple attempts with timeouts
    setTimeout(forceScrollToTop, 100);
    setTimeout(forceScrollToTop, 300);
    setTimeout(forceScrollToTop, 500);
  }
  
  // Override any scroll restoration behavior
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
});

// Prevent scroll restoration on page reload
window.addEventListener('beforeunload', function() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  sessionStorage.setItem('manualScrollControl', 'true');
}); 