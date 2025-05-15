/**
 * URL handler for Tepper & Bennett
 * Manages URL hash behavior and scroll functionality
 */

// Initialize scroll handler (IIFE to avoid global namespace pollution)
(function() {
  // Debug state - set to false for production
  const DEBUG = false;
  
  // Logger function that only logs when DEBUG is true
  function log(message, ...args) {
    if (DEBUG) {
      console.log(`[URL Handler] ${message}`, ...args);
    }
  }
  
  log('Initializing URL handler');
  
  // Helper function to expand a section and scroll to it
  function expandAndScrollToSection(sectionId, shouldScroll = true) {
    console.log('expandAndScrollToSection called with sectionId:', sectionId);
    
    // Handle both formats of IDs (with and without -heading suffix)
    let headingId = sectionId;
    if (!headingId.endsWith('-heading')) {
      // If the ID doesn't end with -heading, assume it's a section ID and append -heading
      headingId = `${sectionId}-heading`;
    } else {
      // If it already has -heading, extract the section ID
      sectionId = headingId.replace('-heading', '');
    }
    
    // First, get the section heading
    const sectionHeading = document.getElementById(headingId);
    if (!sectionHeading) {
      console.log(`Could not find heading with ID: ${headingId}`);
      return false;
    }
    
    // If toggleSection function is available from collapsible.js, use it
    if (typeof window.tb === 'object' && typeof window.tb.toggleSection === 'function') {
      // Use the centralized toggle function
      const success = window.tb.toggleSection(sectionHeading, true);
      
      // Scroll to the section if needed
      if (success && shouldScroll) {
        scrollToSection(sectionId, sectionHeading);
      }
      
      return success;
    }
    
    // Fallback implementation if the centralized toggle function is not available
    // Expand the section if it's not already expanded
    if (sectionHeading.getAttribute('aria-expanded') === 'false') {
      sectionHeading.setAttribute('aria-expanded', 'true');
      sectionHeading.querySelector('.toggle-icon').textContent = '−';
      
      const content = document.getElementById(`${sectionId}-content`);
      if (content) {
        content.classList.add('open');
        content.classList.remove('section-initially-closed');
        
        // Explicitly set visibility and display properties
        content.style.visibility = 'visible';
        content.style.maxHeight = 'none';
        content.style.opacity = '1';
        content.style.display = 'block';
      }
      
      // Also update the collapsible.js state
      try {
        const closedSectionsSet = new Set(JSON.parse(localStorage.getItem('tepperBennettClosedSections') || '[]'));
        closedSectionsSet.delete(sectionId);
        localStorage.setItem('tepperBennettClosedSections', JSON.stringify(Array.from(closedSectionsSet)));
      } catch (e) {
        if (DEBUG) console.error('Error updating closed sections:', e);
      }
    }
    
    // Scroll to section if needed
    if (shouldScroll) {
      scrollToSection(sectionId, sectionHeading);
    }
    
    return true;
  }
  
  // Helper function to scroll to a section
  function scrollToSection(sectionId, sectionHeading) {
    // Try to find the section element directly
    const target = document.getElementById(sectionId);
    
    // Use ScrollUtils if available
    if (typeof ScrollUtils !== 'undefined' && ScrollUtils.scrollToElement) {
      if (target) {
        ScrollUtils.scrollToElement(target);
      } else if (sectionHeading) {
        ScrollUtils.scrollToElement(sectionHeading);
      }
    } else {
      // Fallback if ScrollUtils is not available
      const scrollBehavior = typeof SCROLL_SETTINGS !== 'undefined' ? SCROLL_SETTINGS.behavior : 'auto';
      if (target) {
        target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      } else if (sectionHeading) {
        sectionHeading.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      }
    }
  }
  
  // Setup scroll-to-top button functionality
  function setupScrollToTop() {
    const scrollToTopButton = document.getElementById('scroll-to-top');
    if (!scrollToTopButton) return;
    
    // Function to toggle button visibility
    function toggleScrollButton() {
      // Show button when scrolled down more than 300px
      if (window.pageYOffset > 300) {
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
  
  // Handle hash links and section expansion
  document.addEventListener('DOMContentLoaded', function() {
    log('DOMContentLoaded event fired');
    
    // Debug: Log all section headings and content elements
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
    
    // Handle hash in URL (expand sections or navigate)
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      log('Hash detected in URL:', sectionId);
      
      // Always expand the section
      setTimeout(() => {
        expandAndScrollToSection(sectionId, true);
      }, 100); // Small delay to ensure other DOM setup is complete
    }
    
    // Handle clicks on anchor links to expand sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').substring(1);
        if (DEBUG) {
          console.log('Clicked link with href:', this.getAttribute('href'));
          console.log('Target ID:', targetId);
        }
        
        if (!targetId) return;
        
        // Prevent default browser scroll behavior so we can control it
        e.preventDefault();
        
        // Update the URL hash without causing scroll
        if (history.pushState) {
          history.pushState(null, null, `#${targetId}`);
          if (DEBUG) {
            console.log('Updated URL hash to:', `#${targetId}`);
          }
        } else {
          // Fallback for older browsers
          window.location.hash = targetId;
        }
        
        // Expand the section and scroll to it
        const result = expandAndScrollToSection(targetId, true);
        if (DEBUG) {
          console.log('expandAndScrollToSection result:', result);
        }
      });
    });
  });
  
  // Also handle popstate (back/forward buttons)
  window.addEventListener('popstate', function() {
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      expandAndScrollToSection(sectionId, true);
    }
  });
})(); 