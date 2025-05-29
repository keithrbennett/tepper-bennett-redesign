/**
 * URL handler for Tepper & Bennett
 * Manages clean URL paths and scroll functionality
 */

// Initialize scroll handler (IIFE to avoid global namespace pollution)
(function() {
  // Debug state - set to false for production
  const DEBUG = window.tbConfig?.debug?.enabled || false;
  
  // Logger function that only logs when DEBUG is true
  function log(message, ...args) {
    if (DEBUG) {
      console.log(`[URL Handler] ${message}`, ...args);
    }
  }
  
  log('Initializing URL handler for clean paths');
  
  // Function to check if a path corresponds to a valid section (sync with section-handler.js)
  function isValidSectionPath(pathId) {
    // Skip common browser requests that aren't sections
    const invalidPaths = ['favicon.ico', 'robots.txt', 'sitemap.xml', 'apple-touch-icon.png'];
    if (invalidPaths.includes(pathId)) {
      return false;
    }
    
    // Skip paths with file extensions
    if (pathId.includes('.')) {
      return false;
    }
    
    // Check if there's actually a corresponding section
    const headingId = pathId.endsWith('-heading') ? pathId : `${pathId}-heading`;
    const hasHeading = document.getElementById(headingId);
    const hasContent = document.getElementById(`${pathId}-content`) || document.getElementById(`${pathId.replace('-heading', '')}-content`);
    
    return !!(hasHeading || hasContent);
  }

  // Helper function to trigger expansion of a section and scroll to it
  function expandAndScrollToSection(sectionIdFromUrl, shouldScroll = true) {
    console.log('[URL-HANDLER] expandAndScrollToSection called with sectionIdFromUrl:', sectionIdFromUrl, 'shouldScroll:', shouldScroll);
    
    // Validate that this is a real section path, not favicon.ico or other browser requests
    if (!isValidSectionPath(sectionIdFromUrl)) {
      console.log('[URL-HANDLER] Invalid section path detected, skipping:', sectionIdFromUrl);
      return false;
    }
    
    // Normalize the sectionId: remove "-heading" if present, as paths are clean
    const cleanSectionId = sectionIdFromUrl.replace('-heading', '');
    console.log('[URL-HANDLER] Clean section ID:', cleanSectionId);
    
    let success = false;
    // Use the global expandSectionById from section-handler.js if available
    if (typeof window.expandSectionById === 'function') {
      console.log('[URL-HANDLER] Calling window.expandSectionById with:', cleanSectionId);
      // section-handler's expandSectionById handles its own scrolling after expansion
      success = window.expandSectionById(cleanSectionId, true); // Pass true for fromURLHandler
      console.log('[URL-HANDLER] window.expandSectionById returned:', success);
    } else {
      console.warn('[URL Handler] window.expandSectionById is not defined. Section may not expand/scroll correctly.');
      // As a minimal fallback, try to scroll to the element if it exists and shouldScroll is true.
      // This part is mostly a safety net.
      const targetElement = document.getElementById(cleanSectionId) || document.getElementById(`${cleanSectionId}-heading`);
      if (targetElement && shouldScroll) {
        if (typeof ScrollUtils !== 'undefined' && ScrollUtils.scrollToElement) {
          ScrollUtils.scrollToElement(targetElement);
          success = true;
        } else {
          targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
          success = true;
        }
      }
    }
    console.log('[URL-HANDLER] expandAndScrollToSection returning:', success);
    return success;
  }
  
  // Setup scroll-to-top button functionality
  function setupScrollToTop() {
    const scrollToTopButton = document.getElementById('scroll-to-top');
    if (!scrollToTopButton) return;
    
    // Function to toggle button visibility
    function toggleScrollButton() {
      // Show button when scrolled down more than 300px
      if (window.pageYOffset > (window.tbConfig?.ui?.scrollToTopVisibilityOffsetPx || 300)) {
        scrollToTopButton.classList.add('visible');
      } else {
        scrollToTopButton.classList.remove('visible');
      }
    }
    
    // Scroll to top with smooth behavior
    scrollToTopButton.addEventListener('click', function() {
      // First clear any hash in the URL to maintain clean state
      if (window.location.hash && history.pushState) {
        history.pushState(null, null, window.location.pathname + window.location.search);
      }
      
      // Scroll to top using centralized scroll settings
      if (typeof ScrollUtils !== 'undefined' && ScrollUtils.scrollToTop) {
        ScrollUtils.scrollToTop();
      } else {
        // Fallback if ScrollUtils is not available
        const scrollBehavior = typeof SCROLL_SETTINGS !== 'undefined' ? SCROLL_SETTINGS.behavior : 'auto';
        window.scrollTo({
          top: 0,
          behavior: scrollBehavior
        });
      }
    });
    
    // Add scroll event listener with throttling for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      if (!scrollTimeout) {
        // Use centralized throttle delay if available (0 means immediate response)
        const throttleDelay = typeof SCROLL_SETTINGS !== 'undefined' ? 
          SCROLL_SETTINGS.timeouts.throttleDelay : 0;
        
        scrollTimeout = setTimeout(function() {
          toggleScrollButton();
          scrollTimeout = null;
        }, throttleDelay);
      }
    });
    
    // Initial check
    toggleScrollButton();
  }
  
  // Handle path-based navigation and section expansion
  document.addEventListener('DOMContentLoaded', function() {
    log('DOMContentLoaded event fired');
    
    // Debug: Log all section elements (keeping for diagnostics)
    if (DEBUG) {
      console.log('=== DEBUG: Checking all section elements ===');
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => {
        const sectionId = section.id;
        const headingId = `${sectionId}-heading`;
        const contentId = `${sectionId}-content`;
        
        const heading = document.getElementById(headingId);
        const content = document.getElementById(contentId);
        
        console.log({
          sectionId,
          headingExists: !!heading,
          headingId: heading ? heading.id : 'N/A',
          contentExists: !!content,
          contentId: content ? content.id : 'N/A'
        });
      });
      console.log('=== END DEBUG ===');
    }
    
    // Setup scroll-to-top button
    setupScrollToTop();
    
    // Handle initial path in URL (expand sections)
    const initialPath = window.location.pathname;
    if (initialPath && initialPath !== '/') {
      const sectionIdFromPath = initialPath.substring(1); // Remove leading '/'
      log('Path detected in URL on load:', sectionIdFromPath);
      
      // Only proceed if it's a valid section path
      if (isValidSectionPath(sectionIdFromPath)) {
        setTimeout(() => {
          expandAndScrollToSection(sectionIdFromPath, true);
        }, window.tbConfig?.animation?.pageLoadSectionDelayMs || 100); 
      } else {
        log('Invalid section path on load, ignoring:', sectionIdFromPath);
      }
    }
    
    // Click handling for a[href^="#"] removed as section-handler.js now handles a[href^="/"]
  });
  
  // Also handle popstate (back/forward buttons) for path changes
  window.addEventListener('popstate', function(event) {
    log('popstate event fired. New path:', window.location.pathname, 'State:', event.state);
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== '/') {
      const sectionIdFromPath = currentPath.substring(1); // Remove leading '/'
      log('popstate: Path detected:', sectionIdFromPath);
      
      // Only proceed if it's a valid section path
      if (isValidSectionPath(sectionIdFromPath)) {
        expandAndScrollToSection(sectionIdFromPath, true);
      } else {
        log('popstate: Invalid section path, ignoring:', sectionIdFromPath);
      }
    } else {
      log('popstate: Path is / (root). No specific section to expand from URL handler.');
      // If the path is now '/', section-handler.js's toggleSectionStandard should have handled collapsing
      // the previously active section when it updated the URL to '/'.
      // No explicit collapse action needed here unless specific state dictates it.
    }
  });
})(); 