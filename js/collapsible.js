/**
 * Collapsible panels management for Tepper & Bennett - SIMPLIFIED VERSION
 */

// Create a namespace for Tepper & Bennett functionality
window.tb = window.tb || {};

document.addEventListener('DOMContentLoaded', function() {
    // Debug flags
    const DEBUG = window.tbConfig?.debug?.enabled || false;
    const DEBUG_SECTIONS = window.tbConfig?.debug?.logSectionEvents || false;
    const DEBUG_ELVIS = window.tbConfig?.debug?.logElvisEvents || false;
    
    // Debug log function
    function debugLog(prefix, message, ...args) {
        if (!DEBUG) return;
        
        if (prefix === 'ELVIS' && !DEBUG_ELVIS) return;
        if (prefix === 'SECTION' && !DEBUG_SECTIONS) return;
        
        console.log(`[${prefix}] ${message}`, ...args);
    }
    
    // Basic elements
    const toggles = document.querySelectorAll('.collapsible-toggle');
    const expandAllButton = document.getElementById('expand-all');
    const collapseAllButton = document.getElementById('collapse-all');
    
    // Storage key for persistent state
    const CLOSED_SECTIONS_KEY = 'tepperBennettClosedSections';
    
    // Helper functions for closed sections storage
    function getClosedSections() {
        try {
            const array = JSON.parse(localStorage.getItem(CLOSED_SECTIONS_KEY) || '[]');
            return new Set(array);
        } catch (e) {
            console.error('Error reading closed sections:', e);
            return new Set();
        }
    }
    
    function saveClosedSections(closedSectionsSet) {
        try {
            localStorage.setItem(CLOSED_SECTIONS_KEY, JSON.stringify(Array.from(closedSectionsSet)));
        } catch (e) {
            console.error('Error saving closed sections:', e);
        }
    }
    
    function addToClosedSections(sectionId) {
        const closedSectionsSet = getClosedSections();
        closedSectionsSet.add(sectionId);
        saveClosedSections(closedSectionsSet);
    }
    
    function removeFromClosedSections(sectionId) {
        const closedSectionsSet = getClosedSections();
        closedSectionsSet.delete(sectionId);
        saveClosedSections(closedSectionsSet);
    }
    
    // Update button states
    function updateButtonStates() {
        const allExpanded = Array.from(toggles).every(toggle =>
            toggle.getAttribute('aria-expanded') === 'true');
        const allCollapsed = Array.from(toggles).every(toggle =>
            toggle.getAttribute('aria-expanded') === 'false');
        
        expandAllButton.disabled = allExpanded;
        collapseAllButton.disabled = allCollapsed;
    }
    
    // Simple scroll to element with offset using centralized settings
    function scrollToElement(element) {
        // Use ScrollUtils if available, otherwise fallback to direct implementation
        if (typeof ScrollUtils !== 'undefined' && ScrollUtils.scrollToElement) {
            ScrollUtils.scrollToElement(element);
            return;
        }

        console.log(`scroll fallback for ${element}`)
        // Fallback implementation
        element.scrollIntoView({ 
            behavior: 'auto', 
            block: 'start'
        });
        
        window.scrollBy({
            top: -10, 
            behavior: 'auto'
        });
    }
    
    // Update URL hash without causing scroll
    function updateUrlHash(sectionId) {
        if (!sectionId) {
            // Clear hash if no section ID provided
            if (window.location.hash && history.pushState) {
                history.pushState(null, null, window.location.pathname);
            }
            return;
        }
        
        if (history.pushState) {
            // Modern browsers
            history.pushState(null, null, `#${sectionId}`);
        } else {
            // Fallback for older browsers
            const scrollPosition = window.pageYOffset;
            window.location.hash = sectionId;
            window.scrollTo(0, scrollPosition);
        }
    }
    
    // Core function to open or close a section
    // This is the central function that handles all toggle behavior
    function toggleSection(toggle, forcedState) {
        // DEBUGGING: Log Elvis-specific behavior
        const isElvis = toggle.id === 'elvis-heading';
        
        if (isElvis && DEBUG_ELVIS) {
            debugLog('ELVIS', 'Toggle click detected on Elvis section');
            debugLog('ELVIS', 'Initial toggle state:', {
                id: toggle.id,
                expanded: toggle.getAttribute('aria-expanded'),
                nextElement: toggle.nextElementSibling ? toggle.nextElementSibling.id : 'none'
            });
        }
        
        // Get section information
        const headingId = toggle.id;
        if (!headingId || !headingId.endsWith('-heading')) {
            if (isElvis && DEBUG_ELVIS) debugLog('ELVIS', 'Invalid heading ID:', headingId);
            return false;
        }
        
        const sectionId = headingId.replace('-heading', '');
        const content = toggle.nextElementSibling;
        if (!content) {
            if (isElvis && DEBUG_ELVIS) debugLog('ELVIS', 'No content element found after heading');
            return false;
        }
        
        if (isElvis && DEBUG_ELVIS) {
            debugLog('ELVIS', 'Content element:', {
                id: content.id,
                class: content.className,
                isVisible: window.getComputedStyle(content).visibility,
                display: window.getComputedStyle(content).display,
                maxHeight: window.getComputedStyle(content).maxHeight,
                opacity: window.getComputedStyle(content).opacity
            });
        }
        
        // Determine if we're opening or closing
        const isCurrentlyExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const willBeExpanded = (forcedState !== undefined) ? forcedState : !isCurrentlyExpanded;
        
        if (isElvis && DEBUG_ELVIS) {
            debugLog('ELVIS', 'Toggle operation:', {
                isCurrentlyExpanded,
                willBeExpanded,
                forcedState
            });
        }
        
        // Update toggle UI
        toggle.setAttribute('aria-expanded', willBeExpanded);
        toggle.querySelector('.toggle-icon').textContent = willBeExpanded ? '−' : '+';
        
        // Update content visibility
        content.classList.toggle('open', willBeExpanded);
        
        // Apply direct style changes for immediate effect
        if (willBeExpanded) {
            // Opening the section
            content.style.visibility = 'visible';
            content.style.maxHeight = 'none';
            content.style.opacity = '1';
            content.style.display = 'block';
            content.classList.remove('section-initially-closed');
            removeFromClosedSections(sectionId);
            
            // Update URL to reflect the open section
            updateUrlHash(sectionId);
            
            if (isElvis && DEBUG_ELVIS) {
                debugLog('ELVIS', 'Elvis section opened, styles applied:', {
                    visibility: content.style.visibility,
                    maxHeight: content.style.maxHeight,
                    opacity: content.style.opacity,
                    display: content.style.display,
                    classes: content.className
                });
            }
        } else {
            // Closing the section
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            addToClosedSections(sectionId);
            
            // If we're closing the section that's in the URL, remove the hash
            if (window.location.hash === `#${sectionId}`) {
                updateUrlHash('');
            }
            
            if (isElvis && DEBUG_ELVIS) {
                debugLog('ELVIS', 'Elvis section closed, styles applied:', {
                    maxHeight: content.style.maxHeight,
                    opacity: content.style.opacity,
                });
                
                debugLog('ELVIS', 'Will set visibility:hidden after transition');
            }
            
            // Delay hiding to allow animation
            setTimeout(() => {
                if (!content.classList.contains('open')) {
                    content.style.visibility = 'hidden';
                    
                    if (isElvis && DEBUG_ELVIS) {
                        debugLog('ELVIS', 'Visibility set to hidden after timeout');
                    }
                }
            }, 300); // Match the CSS transition duration
        }
        
        // Check for Elvis-specific behavior after the operation
        if (isElvis && DEBUG_ELVIS) {
            setTimeout(() => {
                debugLog('ELVIS', 'Elvis section state after changes:', {
                    toggleExpanded: toggle.getAttribute('aria-expanded'),
                    contentOpen: content.classList.contains('open'),
                    computedStyle: {
                        visibility: window.getComputedStyle(content).visibility,
                        display: window.getComputedStyle(content).display,
                        maxHeight: window.getComputedStyle(content).maxHeight,
                        opacity: window.getComputedStyle(content).opacity
                    }
                });
            }, 350); // Check after the transition should be complete
        }
        
        // Update expand/collapse all buttons
        updateButtonStates();
        
        return true;
    }
    
    // Expose the toggle function globally so it can be used by other scripts
    window.tb.toggleSection = toggleSection;
    
    // Helper function to expand a section (used by direct links)
    function expandSection(sectionId) {
        // DEBUGGING: Log Elvis-specific behavior
        const isElvis = sectionId === 'elvis' || sectionId === 'elvis-heading';
        if (isElvis && DEBUG_ELVIS) {
            debugLog('ELVIS', 'expandSection called for Elvis:', sectionId);
        }
        
        // Handle both formats of IDs (with and without -heading suffix)
        let headingId = sectionId;
        if (!headingId.endsWith('-heading')) {
            // If the ID doesn't end with -heading, append it
            headingId = `${sectionId}-heading`;
        } else {
            // If it already has -heading, extract the base section ID
            sectionId = headingId.replace('-heading', '');
        }
        
        const targetToggle = document.getElementById(headingId);
        if (targetToggle) {
            if (isElvis && DEBUG_ELVIS) {
                debugLog('ELVIS', 'Found target toggle element:', targetToggle.id);
            }
            
            // Use the central toggle function to open the section
            const success = toggleSection(targetToggle, true);
            
            if (success) {
                // Scroll to the heading after opening
                scrollToElement(targetToggle);
                return true;
            }
        } else if (isElvis && DEBUG_ELVIS) {
            debugLog('ELVIS', 'Could not find toggle element for ID:', headingId);
        }
        return false;
    }
    
    // Also expose the expandSection function globally
    window.tb.expandSection = expandSection;
    
    // Setup each toggle
    toggles.forEach(toggle => {
        // Toggle on click
        toggle.addEventListener('click', function() {
            // Use the central toggle function
            toggleSection(this);
        });
        
        // Keyboard support
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Expand All button
    expandAllButton.addEventListener('click', function() {
        if (this.disabled) return;

        toggles.forEach(toggle => {
            // Use the central toggle function to open all sections
            toggleSection(toggle, true);
        });

        // Clear URL hash when all sections are expanded
        updateUrlHash('');
    });
    
    // Collapse All button
    collapseAllButton.addEventListener('click', function() {
        if (this.disabled) return;

        toggles.forEach(toggle => {
            // Use the central toggle function to close all sections
            toggleSection(toggle, false);
        });

        // Clear URL hash when all sections are collapsed
        updateUrlHash('');
    });
    
    // Check URL hash on initial load
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        if (targetId) {
            // Log if we're targeting Elvis section
            if ((targetId === 'elvis' || targetId === 'elvis-heading') && DEBUG_ELVIS) {
                debugLog('ELVIS', 'Initial URL hash targeting Elvis section:', targetId);
            }
            expandSection(targetId);
        }
    }
    
    // Initialize button states
    updateButtonStates();
});