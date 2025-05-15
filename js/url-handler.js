/**
 * URL handler for Tepper & Bennett
 * Manages URL hash behavior
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
  
  // Store page load state for refresh detection
  const isRefresh = sessionStorage.getItem('pageLoaded') === 'true';
  sessionStorage.setItem('pageLoaded', 'true');
  
  // Helper function to expand a section and scroll to it
  function expandAndScrollToSection(sectionId, shouldScroll = true) {
    // First, get the section heading
    const sectionHeading = document.getElementById(`${sectionId}-heading`);
    if (!sectionHeading) return false;
    
    // Expand the section if it's not already expanded
    if (sectionHeading.getAttribute('aria-expanded') === 'false') {
      sectionHeading.setAttribute('aria-expanded', 'true');
      sectionHeading.querySelector('.toggle-icon').textContent = '−';
      
      const content = document.getElementById(`${sectionId}-content`);
      if (content) {
        content.classList.add('open');
        content.classList.remove('section-initially-closed');
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
    
    // Scroll to section with a small delay to ensure the section is expanded
    if (shouldScroll) {
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (sectionHeading) {
          sectionHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    
    return true;
  }
  
  // Handle hash links and section expansion
  document.addEventListener('DOMContentLoaded', function() {
    log('DOMContentLoaded event fired');
    
    // Handle hash in URL (expand sections or navigate)
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      log('Hash detected in URL:', sectionId);
      
      // For refreshes, we need to handle navigation specially
      if (isRefresh) {
        log('Page refresh detected with hash:', sectionId);
        
        // Always expand the section
        expandAndScrollToSection(sectionId, true);
      } else {
        // Direct navigation via URL
        log('Direct navigation to section:', sectionId);
        
        // Expand the section and scroll to it
        expandAndScrollToSection(sectionId, true);
      }
    }
    
    // Handle clicks on anchor links to expand sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').substring(1);
        if (!targetId) return;
        
        // Prevent default browser scroll behavior so we can control it
        e.preventDefault();
        
        // Update the URL hash without causing scroll
        if (history.pushState) {
          history.pushState(null, null, `#${targetId}`);
        } else {
          // Fallback for older browsers
          window.location.hash = targetId;
        }
        
        // Expand the section and scroll to it
        expandAndScrollToSection(targetId, true);
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