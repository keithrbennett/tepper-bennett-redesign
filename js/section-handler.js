// Define globally so it's accessible everywhere
let isUpdatingFromURL = false; // Flag to prevent infinite loops


// Function to check if a path corresponds to a valid section
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

function toggleSectionStandard(toggle, forcedState, fromURLHandler = false) {
    if (!toggle || !toggle.id || !toggle.id.endsWith('-heading')) {
        console.error('[SECTION-HANDLER] Invalid toggle element:', toggle);
        return false;
    }
    // Get section information
    const sectionId = toggle.id.replace('-heading', '');
    const content = document.getElementById(`${sectionId}-content`);
    if (!content) {
        console.error('[SECTION-HANDLER] Content element not found for section:', sectionId);
        return false;
    }
    // Get current state and determine action
    const isCurrentlyExpanded = toggle.getAttribute('aria-expanded') === 'true';
    const willBeExpanded = (forcedState !== undefined) ? forcedState : !isCurrentlyExpanded;
    
    // Update toggle button
    toggle.setAttribute('aria-expanded', willBeExpanded);
    const toggleIcon = toggle.querySelector('.toggle-icon');
    if (toggleIcon) {
        toggleIcon.textContent = willBeExpanded ? '−' : '+';
    }
    // Update content visibility
    if (willBeExpanded) {
        // Expanding section
        content.classList.add('open');
        content.style.visibility = 'visible';
        content.style.maxHeight = 'none';
        content.style.opacity = '1';
        content.style.display = 'block';
        // Update URL hash only if not coming from URL handler
        if (!fromURLHandler && !isUpdatingFromURL && window.location.hash !== `#${sectionId}`) {
            window.location.hash = sectionId;
        }
    } else {
        // Collapsing section
        content.classList.remove('open');
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        // If collapsing the section currently in hash, clear hash
        if (!fromURLHandler && !isUpdatingFromURL && window.location.hash === `#${sectionId}`) {
            window.location.hash = '';
        }
        setTimeout(() => {
            if (toggle.getAttribute('aria-expanded') !== 'true') {
                content.style.visibility = 'hidden';
            }
        }, window.tbConfig?.animation?.shortDurationMs || 300);
    }
    return true;
}
window.toggleSectionStandard = toggleSectionStandard;

document.addEventListener('DOMContentLoaded', function() {
    // Function to expand a section by ID
    function expandSectionById(sectionId, fromURLHandler = false) {
        if (!sectionId) return false;
        
        const headingId = sectionId.endsWith('-heading') ? sectionId : `${sectionId}-heading`;
        const toggle = document.getElementById(headingId);
        
        if (toggle) {
            if (fromURLHandler) {
                isUpdatingFromURL = true;
            }
            const success = toggleSectionStandard(toggle, true, fromURLHandler);
            if (fromURLHandler) {
                setTimeout(() => { isUpdatingFromURL = false; }, 50);
            }
            if (success) {
                ScrollUtils.scrollAfterExpansion(toggle);
                return true;
            }
        }
        return false;
    }
    // Make expandSectionById globally accessible for url-handler.js
    window.expandSectionById = expandSectionById;

    // Setup all section toggles
    const toggles = document.querySelectorAll('.collapsible-toggle');
    toggles.forEach((toggle) => {
        const clone = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(clone, toggle);
        clone.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            const success = toggleSectionStandard(this);
            
            // If section was expanded, scroll to it after animation completes
            if (success && this.getAttribute('aria-expanded') === 'true') {
                ScrollUtils.scrollAfterExpansion(this);
            }
        });
        clone.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const success = toggleSectionStandard(this);
                
                // If section was expanded, scroll to it after animation completes
                if (success && this.getAttribute('aria-expanded') === 'true') {
                    ScrollUtils.scrollAfterExpansion(this);
                }
            }
        });
    });
    // Handle expand/collapse all buttons
    const expandAllButton = document.getElementById('expand-all');
    const collapseAllButton = document.getElementById('collapse-all');
    if (expandAllButton) {
        expandAllButton.addEventListener('click', function() {
            const allToggles = document.querySelectorAll('.collapsible-toggle');
            allToggles.forEach(toggle => toggleSectionStandard(toggle, true));
        });
    }
    if (collapseAllButton) {
        collapseAllButton.addEventListener('click', function() {
            const allToggles = document.querySelectorAll('.collapsible-toggle');
            allToggles.forEach(toggle => toggleSectionStandard(toggle, false));
        });
    }
    // Handle navigation links that point to sections
    const navLinks = document.querySelectorAll('a[href^="/"]');
    navLinks.forEach(link => {
        const path = link.getAttribute('href');
        if (path.startsWith('/') && !path.includes(':')) { 
            const targetId = path.substring(1);
            if (targetId && isValidSectionPath(targetId)) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const sectionToExpand = document.getElementById(`${targetId}-heading`) ? targetId : (document.getElementById(targetId) ? targetId.replace('-heading','') : null);
                    if (sectionToExpand) {
                        if (window.location.pathname !== `/${sectionToExpand}`) {
                            history.pushState({ sectionId: sectionToExpand }, '', `/${sectionToExpand}`);
                        }
                        expandSectionById(sectionToExpand, true); 
                    }
                });
            }
        }
    });

    // Check URL path to open appropriate section on load
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== '/') {
        const pathId = currentPath.substring(1);
        if (pathId && isValidSectionPath(pathId)) {
            setTimeout(() => {
                expandSectionById(pathId);
            }, window.tbConfig?.animation?.pageLoadSectionDelayMs || 100); // Use config for delay
        }
    }


}); 