// Define globally so it's accessible everywhere
function toggleSectionStandard(toggle, forcedState) {
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
    console.log(`[SECTION-HANDLER] ${sectionId} section will be ${willBeExpanded ? 'expanded' : 'collapsed'}`);
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
        history.replaceState(null, null, `#${sectionId}-heading`);
    } else {
        // Collapsing section
        content.classList.remove('open');
        content.style.maxHeight = '0';
        content.style.opacity = '0';
        if (window.location.hash === `#${sectionId}-heading`) {
            history.replaceState(null, null, window.location.pathname);
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
    function expandSectionById(sectionId) {
        if (!sectionId) return false;
        const headingId = sectionId.endsWith('-heading') ? sectionId : `${sectionId}-heading`;
        const toggle = document.getElementById(headingId);
        if (toggle) {
            const success = toggleSectionStandard(toggle, true);
            if (success) {
                setTimeout(() => {
                    if (typeof ScrollUtils !== 'undefined' && ScrollUtils.scrollToElement) {
                        ScrollUtils.scrollToElement(toggle);
                    } else {
                        console.warn('[SECTION-HANDLER] ScrollUtils not available, falling back to simple scroll.');
                        toggle.scrollIntoView({ behavior: 'auto', block: 'start' }); // Fallback
                    }
                }, 30); // Small delay for content to become visible before scrolling
                return true;
            }
        }
        return false;
    }
    // Setup all section toggles
    const toggles = document.querySelectorAll('.collapsible-toggle');
    toggles.forEach((toggle) => {
        const clone = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(clone, toggle);
        clone.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            toggleSectionStandard(this);
        });
        clone.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSectionStandard(this);
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
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        const targetId = link.getAttribute('href').substring(1);
        if (targetId && (targetId.endsWith('-heading') || document.getElementById(`${targetId}-heading`))) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                expandSectionById(targetId);
            });
        }
    });
    // Check URL hash to open appropriate section
    if (window.location.hash) {
        const hashId = window.location.hash.substring(1);
        if (hashId) {
            setTimeout(() => {
                expandSectionById(hashId);
            }, 100);
        }
    }
    console.log('[SECTION-HANDLER] Standardized section handler initialized successfully');
}); 