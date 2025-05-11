/**
 * Collapsible panels management for Tepper & Bennett
 */
document.addEventListener('DOMContentLoaded', function() {
    // Basic elements
    const toggles = document.querySelectorAll('.collapsible-toggle');
    // const contents = document.querySelectorAll('.collapsible-content'); // Not needed
    const expandAllButton = document.getElementById('expand-all');
    const collapseAllButton = document.getElementById('collapse-all');
    
    // Storage keys for persistent state
    const CLOSED_SECTIONS_KEY = 'tepperBennettClosedSections';
    const ALL_EXPANDED_KEY = 'tepperBennettAllExpanded';
    
    // Helper functions for closed sections storage
    function getClosedSections() {
        try {
            return JSON.parse(localStorage.getItem(CLOSED_SECTIONS_KEY) || '[]');
        } catch (e) {
            console.error('Error reading closed sections:', e);
            return [];
        }
    }
    
    function saveClosedSections(closedSections) {
        try {
            localStorage.setItem(CLOSED_SECTIONS_KEY, JSON.stringify(closedSections));
        } catch (e) {
            console.error('Error saving closed sections:', e);
        }
    }
    
    function addToClosedSections(sectionId) {
        const closedSections = getClosedSections();
        if (!closedSections.includes(sectionId)) {
            closedSections.push(sectionId);
            saveClosedSections(closedSections);
        }
    }
    
    function removeFromClosedSections(sectionId) {
        const closedSections = getClosedSections();
        const index = closedSections.indexOf(sectionId);
        if (index !== -1) {
            closedSections.splice(index, 1);
            saveClosedSections(closedSections);
        }
    }
    
    function isSectionClosed(sectionId) {
        return getClosedSections().includes(sectionId);
    }

    // Helper functions for all-expanded state
    function isAllExpanded() {
        try {
            return localStorage.getItem(ALL_EXPANDED_KEY) === 'true';
        } catch (e) {
            console.error('Error reading all-expanded state:', e);
            return false;
        }
    }

    function setAllExpanded(expanded) {
        try {
            localStorage.setItem(ALL_EXPANDED_KEY, expanded);
        } catch (e) {
            console.error('Error saving all-expanded state:', e);
        }
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
    
    // Update URL hash without scrolling
    function updateUrlHash(sectionId, scrollToSection = false) {
        if (history.pushState) {
            // Modern browsers
            const url = sectionId ? `#${sectionId}` : window.location.pathname;
            history.pushState(null, null, url);
        } else {
            // Fallback for older browsers
            if (scrollToSection) {
                window.location.hash = sectionId;
            } else {
                // This is a hack to avoid scrolling when setting the hash
                const scrollPosition = window.pageYOffset;
                window.location.hash = sectionId;
                window.scrollTo(0, scrollPosition);
            }
        }
    }
    
    // Helper function to expand a section
    function expandSection(sectionId) {
        const targetToggle = document.getElementById(`${sectionId}-heading`);
        if (targetToggle) {
            targetToggle.setAttribute('aria-expanded', 'true');
            targetToggle.querySelector('.toggle-icon').textContent = '−';
            const content = targetToggle.nextElementSibling;
            content.classList.add('open');
            content.classList.remove('section-initially-closed');
            // Always remove from closed sections when explicitly expanded
            removeFromClosedSections(sectionId);
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

        // Check if this section is targeted by URL hash
        const isTargetedByHash = window.location.hash === `#${sectionId}`;

        // Initial state is now handled by the inline script, only handle URL hash overrides
        if (isTargetedByHash) {
            // URL hash takes precedence - section should be open
            toggle.setAttribute('aria-expanded', 'true');
            toggle.querySelector('.toggle-icon').textContent = '−';
            content.classList.add('open');
            content.classList.remove('section-initially-closed');
            // Remove from closed sections
            removeFromClosedSections(sectionId);
        }
        
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
            }

            // Remember user preference
            if (willBeExpanded) {
                removeFromClosedSections(sectionId);
                // Update URL to show which section we're viewing
                updateUrlHash(sectionId);

                // Check if all sections are now expanded
                const allNowExpanded = Array.from(toggles).every(t =>
                    t.getAttribute('aria-expanded') === 'true');
                if (allNowExpanded) {
                    setAllExpanded(true);
                }
            } else {
                addToClosedSections(sectionId);
                // When any section is collapsed, we're no longer in "all expanded" state
                setAllExpanded(false);

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

        // Set the all-expanded state to true
        setAllExpanded(true);

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

        // Set the all-expanded state to false
        setAllExpanded(false);

        // Clear URL hash when all sections are collapsed
        updateUrlHash('');

        updateButtonStates();
    });
    
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function() {
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;

            const targetToggle = document.getElementById(`${targetId}-heading`);
            const targetElement = document.getElementById(targetId);

            // Always expand the section when clicked directly
            if (targetToggle) {
                if (targetToggle.getAttribute('aria-expanded') === 'false') {
                    // Expand the section if it's closed
                    targetToggle.setAttribute('aria-expanded', 'true');
                    targetToggle.querySelector('.toggle-icon').textContent = '−';
                    const content = targetToggle.nextElementSibling;
                    content.classList.add('open');
                    content.classList.remove('section-initially-closed');

                    // Always remove from closed sections when accessed via anchor
                    removeFromClosedSections(targetId);
                    updateButtonStates();
                }

                // Always update the URL
                updateUrlHash(targetId, true);
            }

            // Scroll to the section
            if (targetElement) {
                setTimeout(() => {
                    // Scroll with a vertical offset to ensure the element isn't hidden by fixed elements
                    const yOffset = -100; // Negative value to scroll element below the top edge
                    const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                }, 100);
            }
        });
    });
    
    // Handle hash in URL on initial load - scroll to section
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        if (targetId) {
            const targetElement = document.getElementById(targetId);

            // Initial state is handled in the toggle setup, just scroll to section
            if (targetElement) {
                setTimeout(() => {
                    // Scroll with a vertical offset to ensure the element isn't hidden by fixed elements
                    const yOffset = -100; // Negative value to scroll element below the top edge
                    const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'smooth'});
                }, 100);
            }
        }
    }
    
    // Listen for hash changes after initial load
    window.addEventListener('hashchange', function() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            if (targetId) {
                // Expand the section and scroll to it
                expandSection(targetId);

                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    setTimeout(() => {
                        // Scroll with a vertical offset to ensure the element isn't hidden by fixed elements
                        const yOffset = -100; // Negative value to scroll element below the top edge
                        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: y, behavior: 'smooth'});
                    }, 100);
                }
            }
        }
    });
    
    // Initialize button states
    updateButtonStates();

    // Fix scroll position when page is refreshed with a hash in the URL
    window.addEventListener('load', function() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Use requestAnimationFrame to ensure the browser has finished any pending layout work
                requestAnimationFrame(() => {
                    // Add a more significant offset to push the section further down
                    const yOffset = -120;
                    const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({top: y, behavior: 'auto'});

                    // Sometimes a single scroll adjustment isn't enough, try again after a short delay
                    setTimeout(() => {
                        const updatedY = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({top: updatedY, behavior: 'auto'});
                    }, 100);
                });
            }
        }
    });
});