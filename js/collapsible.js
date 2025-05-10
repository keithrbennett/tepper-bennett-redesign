/**
 * Gestion des panneaux pliables pour Tepper & Bennett
 */
document.addEventListener('DOMContentLoaded', function() {
    // Script pour les panneaux pliables
    const toggles = document.querySelectorAll('.collapsible-toggle');
    const contents = document.querySelectorAll('.collapsible-content');
    const expandAllButton = document.getElementById('expand-all');
    const collapseAllButton = document.getElementById('collapse-all');
    
    // Fonction pour mettre à jour l'état des boutons
    function updateButtonStates() {
        const allExpanded = Array.from(contents).every(content => content.classList.contains('open'));
        const allCollapsed = Array.from(contents).every(content => !content.classList.contains('open'));
        
        expandAllButton.disabled = allExpanded;
        collapseAllButton.disabled = allCollapsed;
    }
    
    // État initial du bouton
    updateButtonStates();
    
    // Fonctionnalité de bascule individuelle
    toggles.forEach(toggle => {
        // S'assurer que aria-expanded est une chaîne
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
            
            // Mettre à jour l'icône de bascule
            const icon = this.querySelector('.toggle-icon');
            icon.textContent = isExpanded ? '+' : '−';
            
            // Basculer le contenu
            const content = this.nextElementSibling;
            content.classList.toggle('open');
            
            updateButtonStates();
        });
        
        // Ajouter la prise en charge du clavier
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Développer toutes les sections
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
    
    // Réduire toutes les sections
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
}); 