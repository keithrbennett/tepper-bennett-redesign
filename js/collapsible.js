/**
 * Collapsible panels management for Tepper & Bennett - SIMPLIFIED VERSION
 */
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Simple scroll to element with offset
    function scrollToElement(element) {
        // Add a small delay to allow CSS transitions to complete
        setTimeout(() => {
            // Use scrollIntoView with a small offset
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
            
            // Add a small offset to show the heading properly
            window.scrollBy({
                top: -10, 
                behavior: 'smooth'
            });
        }, 10);
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
    
    // Helper function to expand a section (used by direct links)
    function expandSection(sectionId) {
        const targetToggle = document.getElementById(`${sectionId}-heading`);
        if (targetToggle) {
            targetToggle.setAttribute('aria-expanded', 'true');
            targetToggle.querySelector('.toggle-icon').textContent = '−';
            const content = targetToggle.nextElementSibling;
            content.classList.add('open');
            content.classList.remove('section-initially-closed');
            removeFromClosedSections(sectionId);
            
            // Scroll to the heading - simple approach
            scrollToElement(targetToggle);
            
            updateButtonStates();
            return true;
        }
        return false;
    }
    
    // Setup each toggle
    toggles.forEach(toggle => {
        // Extract section ID
        const headingId = toggle.id;
        if (!headingId || !headingId.endsWith('-heading')) return;

        const sectionId = headingId.replace('-heading', '');
        const content = toggle.nextElementSibling;

        // Toggle on click
        toggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const willBeExpanded = !isExpanded;

            // Update UI
            this.setAttribute('aria-expanded', willBeExpanded);
            this.querySelector('.toggle-icon').textContent = willBeExpanded ? '−' : '+';
            content.classList.toggle('open', willBeExpanded);
            
            if (willBeExpanded) {
                content.classList.remove('section-initially-closed');
                removeFromClosedSections(sectionId);
                updateUrlHash(sectionId);
            } else {
                addToClosedSections(sectionId);
                
                // If we're closing the section that's in the URL, remove the hash
                if (window.location.hash === `#${sectionId}`) {
                    updateUrlHash('');
                }
            }

            updateButtonStates();
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
            const headingId = toggle.id;
            if (!headingId || !headingId.endsWith('-heading')) return;

            const sectionId = headingId.replace('-heading', '');
            const content = toggle.nextElementSibling;

            toggle.setAttribute('aria-expanded', 'true');
            toggle.querySelector('.toggle-icon').textContent = '−';
            content.classList.add('open');
            content.classList.remove('section-initially-closed');

            removeFromClosedSections(sectionId);
        });

        // Clear URL hash when all sections are expanded
        updateUrlHash('');
        updateButtonStates();
    });
    
    // Collapse All button
    collapseAllButton.addEventListener('click', function() {
        if (this.disabled) return;

        toggles.forEach(toggle => {
            const headingId = toggle.id;
            if (!headingId || !headingId.endsWith('-heading')) return;

            const sectionId = headingId.replace('-heading', '');
            const content = toggle.nextElementSibling;

            toggle.setAttribute('aria-expanded', 'false');
            toggle.querySelector('.toggle-icon').textContent = '+';
            content.classList.remove('open');

            addToClosedSections(sectionId);
        });

        // Clear URL hash when all sections are collapsed
        updateUrlHash('');
        updateButtonStates();
    });
    
    // Check URL hash on initial load
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        if (targetId) {
            expandSection(targetId);
        }
    }
    
    // Initialize button states
    updateButtonStates();
});