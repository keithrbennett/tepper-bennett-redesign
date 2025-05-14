/**
 * URL handler for Tepper & Bennett
 * Manages URL hash behavior
 */

// CRITICAL: Add a style element to prevent any automatic scrolling
(function() {
  console.log('[DEBUG] URL Handler: Initializing script');
  // Create a style element to lock the scroll position until we're ready
  const style = document.createElement('style');
  style.id = 'scroll-lock';
  style.textContent = `
    html, body {
      scroll-behavior: auto !important;
    }
  `;
  document.head.appendChild(style);
  console.log('[DEBUG] URL Handler: Added scroll lock style');
  
  // Store original hash if any
  if (window.location.hash) {
    console.log('[DEBUG] URL Handler: Hash detected in URL:', window.location.hash);
    sessionStorage.setItem('originalHash', window.location.hash);
    
    // If this appears to be a refresh, immediately clear the hash
    if (sessionStorage.getItem('pageLoaded') === 'true') {
      console.log('[DEBUG] URL Handler: Page refresh with hash detected, clearing hash');
      // Use replaceState to avoid creating a history entry
      if (history.replaceState) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
        console.log('[DEBUG] URL Handler: Hash cleared via replaceState');
      }
    }
  } else {
    console.log('[DEBUG] URL Handler: No hash in URL');
  }
  
  // Set scroll restoration to manual
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    console.log('[DEBUG] URL Handler: Set scrollRestoration to manual');
  }
  
  // Flag to track if we're handling the scroll ourselves
  window.urlHandlerControllingScroll = true;
  console.log('[DEBUG] URL Handler: Set urlHandlerControllingScroll flag to true');
})();

document.addEventListener('DOMContentLoaded', function() {
  console.log('[DEBUG] URL Handler: DOMContentLoaded event fired');
  
  // Set scroll restoration to manual to prevent browser auto-scroll
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    console.log('[DEBUG] URL Handler: Set scrollRestoration to manual (DOMContentLoaded)');
  }

  const isRefresh = sessionStorage.getItem('pageLoaded') === 'true';
  const originalHash = sessionStorage.getItem('originalHash');
  console.log('[DEBUG] URL Handler: isRefresh =', isRefresh, 'originalHash =', originalHash);
  
  // Clear the scrollLock if it exists
  const scrollLock = document.getElementById('scroll-lock');
  if (scrollLock) {
    scrollLock.remove();
    console.log('[DEBUG] URL Handler: Removed scroll lock style');
  }
  
  if (isRefresh) {
    console.log('[DEBUG] URL Handler: Page refresh detected');
    // Remove the hash without causing a page jump
    if (history.replaceState) {
      history.replaceState(null, null, window.location.pathname + window.location.search);
      console.log('[DEBUG] URL Handler: Hash cleared via replaceState (refresh)');
    } else {
      // Fallback for older browsers - this will cause a scroll to top
      window.location.hash = '';
      console.log('[DEBUG] URL Handler: Fallback hash clearing (older browsers)');
    }
    
    // Block other scroll handlers
    sessionStorage.setItem('blockOtherScrollHandlers', 'true');
    console.log('[DEBUG] URL Handler: Set blockOtherScrollHandlers flag');
  } else {
    // Direct link to a section, let the normal behavior happen
    console.log('[DEBUG] URL Handler: Direct link to section detected, allowing auto-scroll');
    
    // Make sure the section is expanded if it's a collapsible section
    const sectionId = window.location.hash.substring(1);
    console.log('[DEBUG] URL Handler: Target section ID =', sectionId);
    const sectionHeading = document.getElementById(`${sectionId}-heading`);
    
    if (sectionHeading && sectionHeading.classList.contains('collapsible-toggle')) {
      console.log('[DEBUG] URL Handler: Found collapsible section heading:', sectionHeading.id);
      if (sectionHeading.getAttribute('aria-expanded') === 'false') {
        // Simulate a click to expand the section
        console.log('[DEBUG] URL Handler: Section is collapsed, will expand it');
        setTimeout(() => {
          sectionHeading.click();
          console.log('[DEBUG] URL Handler: Clicked section heading to expand');
        }, 100);
      } else {
        console.log('[DEBUG] URL Handler: Section is already expanded');
      }
    } else {
      console.log('[DEBUG] URL Handler: No collapsible section heading found for ID:', sectionId);
    }
  }
  
  // Mark that the page has been loaded for future refresh detection
  sessionStorage.setItem('pageLoaded', 'true');
  console.log('[DEBUG] URL Handler: Set pageLoaded flag to true');
});

// Capture and prevent all hash changes
window.addEventListener('hashchange', function(e) {
  console.log('[DEBUG] URL Handler: hashchange event detected');
  if (window.urlHandlerControllingScroll) {
    console.log('[DEBUG] URL Handler: Intercepting hash change event');
    e.preventDefault();
    e.stopPropagation();
    return false;
  } else {
    console.log('[DEBUG] URL Handler: Allowing hash change event');
  }
});

// Additional handler for the load event
window.addEventListener('load', function() {
  console.log('[DEBUG] URL Handler: load event fired');
  
  // Make sure any scroll lock is removed
  const scrollLock = document.getElementById('scroll-lock');
  if (scrollLock) {
    scrollLock.remove();
    console.log('[DEBUG] URL Handler: Removed scroll lock style (load event)');
  }
  
  // Disable control after a short delay to allow normal navigation
  setTimeout(() => {
    window.urlHandlerControllingScroll = false;
    console.log('[DEBUG] URL Handler: Released scroll control');
  }, 500);
});

// Prevent scroll restoration on page reload
window.addEventListener('beforeunload', function() {
  console.log('[DEBUG] URL Handler: beforeunload event fired');
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    console.log('[DEBUG] URL Handler: Set scrollRestoration to manual (beforeunload)');
  }
  sessionStorage.setItem('manualScrollControl', 'true');
  console.log('[DEBUG] URL Handler: Set manualScrollControl flag to true');
}); 