/**
 * Collapsible panels management for Tepper & Bennett
 */
document.addEventListener('DOMContentLoaded', function() {
    // Script for collapsible panels
    const toggles = document.querySelectorAll('.collapsible-toggle');
    const contents = document.querySelectorAll('.collapsible-content');
    const expandAllButton = document.getElementById('expand-all');
    const collapseAllButton = document.getElementById('collapse-all');
    
    // Function to update button states
    function updateButtonStates() {
        const allExpanded = Array.from(contents).every(content => content.classList.contains('open'));
        const allCollapsed = Array.from(contents).every(content => !content.classList.contains('open'));
        
        expandAllButton.disabled = allExpanded;
        collapseAllButton.disabled = allCollapsed;
    }
    
    // Function to expand a specific section
    function expandSection(sectionId) {
        const toggle = document.querySelector(`#${sectionId}-heading`);
        if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
            toggle.setAttribute('aria-expanded', 'true');
            toggle.querySelector('.toggle-icon').textContent = '−';
            toggle.nextElementSibling.classList.add('open');
            updateButtonStates();
        }
    }
    
    // Initial button state
    updateButtonStates();
    
    // Individual toggle functionality
    toggles.forEach(toggle => {
        // Ensure aria-expanded is a string
        if (toggle.getAttribute('aria-expanded') === 'true') {
            toggle.querySelector('.toggle-icon').textContent = '−';
            toggle.nextElementSibling.classList.add('open');
        } else {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.querySelector('.toggle-icon').textContent = '+';
        }
        
        toggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            
            // Update toggle icon
            const icon = this.querySelector('.toggle-icon');
            icon.textContent = isExpanded ? '+' : '−';
            
            // Toggle content
            const content = this.nextElementSibling;
            content.classList.toggle('open');
            
            updateButtonStates();
        });
        
        // Add keyboard support
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Expand all sections
    expandAllButton.addEventListener('click', function() {
        if (!this.disabled) {
            toggles.forEach(toggle => {
                toggle.setAttribute('aria-expanded', 'true');
                toggle.querySelector('.toggle-icon').textContent = '−';
            });
            contents.forEach(content => content.classList.add('open'));
            updateButtonStates();
        }
    });
    
    // Collapse all sections
    collapseAllButton.addEventListener('click', function() {
        if (!this.disabled) {
            toggles.forEach(toggle => {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.querySelector('.toggle-icon').textContent = '+';
            });
            contents.forEach(content => content.classList.remove('open'));
            updateButtonStates();
        }
    });
    
    // Handle anchor links to automatically open sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function() {
            // Get the target section ID without the #
            const targetId = this.getAttribute('href').substring(1);
            
            // If the ID corresponds to a collapsible section, open it
            if (targetId && document.getElementById(`${targetId}-heading`)) {
                expandSection(targetId);
            }
        });
    });
    
    // Check if a hash is present in the URL when the page loads
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        if (targetId && document.getElementById(`${targetId}-heading`)) {
            expandSection(targetId);
            // Smooth scroll to the section after a short delay to allow the section to open
            setTimeout(() => {
                document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}); 