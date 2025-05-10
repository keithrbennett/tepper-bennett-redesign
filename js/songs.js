/**
 * Gestion des chansons et de la pagination mobile pour Tepper & Bennett
 */
document.addEventListener('DOMContentLoaded', function() {
    // Recherche de chansons
    const searchInput = document.getElementById('songs-search');
    const searchButton = document.getElementById('search-button');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.toLowerCase();
            console.log('Recherche de :', searchTerm);
            // Ajouter ici la fonctionnalité de recherche
        });
    }
    
    // Données des chansons pour les tableaux
    window.songData = [
        {
            title: "Red Roses for a Blue Lady",
            performers: "Vaughn Monroe, Wayne Newton, Vic Dana",
            administrator: "Universal Music Publishing Group",
            youtubeUrl: "https://www.youtube.com/watch?v=2bQZ6l_cq5Y"
        },
        {
            title: "The Naughty Lady of Shady Lane",
            performers: "The Ames Brothers, Dean Martin",
            administrator: "Warner Chappell Music",
            youtubeUrl: "https://www.youtube.com/watch?v=rEMrl7HgrpA"
        },
        {
            title: "Kiss of Fire",
            performers: "Georgia Gibbs, Louis Armstrong",
            administrator: "Warner Chappell Music",
            youtubeUrl: "https://www.youtube.com/watch?v=68oyEZDl1T4"
        },
        {
            title: "The Young Ones",
            performers: "Cliff Richard",
            administrator: "Sony Music Publishing",
            youtubeUrl: "https://www.youtube.com/watch?v=Juw_Vt8Y1A8"
        },
        {
            title: "G.I. Blues",
            performers: "Elvis Presley",
            administrator: "Universal Music Publishing Group",
            youtubeUrl: "https://www.youtube.com/watch?v=QMUHt5cATmk"
        },
        {
            title: "Am I Ready",
            performers: "Elvis Presley",
            administrator: "Universal Music Publishing Group",
            youtubeUrl: "https://www.youtube.com/watch?v=example1"
        },
        {
            title: "Angel",
            performers: "Elvis Presley",
            administrator: "Warner Chappell Music",
            youtubeUrl: "https://www.youtube.com/watch?v=example2"
        },
        {
            title: "D in Love",
            performers: "Cliff Richard",
            administrator: "Universal Music",
            youtubeUrl: "https://www.youtube.com/watch?v=example3"
        }
        // Ajouter d'autres chansons ici quand elles seront disponibles
    ];
    
    // Pagination du tableau mobile
    const ROWS_PER_PAGE = 10;
    let currentPage = 0;
    
    const mobileList = document.getElementById('mobile-songs-list');
    const prevButton = document.getElementById('mobile-prev-page');
    const nextButton = document.getElementById('mobile-next-page');
    
    // Fonction pour rendre la liste mobile
    window.renderMobileList = function() {
        if (!mobileList) return;
        
        mobileList.innerHTML = '';
        
        const start = currentPage * ROWS_PER_PAGE;
        const end = Math.min(start + ROWS_PER_PAGE, window.songData.length);
        const pageData = window.songData.slice(start, end);
        
        pageData.forEach(song => {
            const listItem = document.createElement('li');
            listItem.className = 'song-list-entry';
            
            // Tronquer les textes longs pour mobile
            const truncateText = (text, maxLength = 20) => {
                if (text.length <= maxLength) return text;
                return text.substring(0, maxLength - 3) + '...';
            };
            
            const title = song.title;
            const performers = truncateText(song.performers, 25);
            const admin = song.administrator ? truncateText(song.administrator, 20) : '';
            
            listItem.innerHTML = `
                <div class="mobile-song-title"><a href="#songs">${title}</a></div>
                <div class="mobile-song-performers">${performers}</div>
                <div class="mobile-song-details">
                    <div class="mobile-song-admin">${admin}</div>
                    <a href="${song.youtubeUrl}" target="_blank" class="listen-button">▶</a>
                </div>
            `;
            
            mobileList.appendChild(listItem);
        });
        
        // Mettre à jour les boutons de pagination
        if (prevButton && nextButton) {
            prevButton.disabled = currentPage === 0;
            nextButton.disabled = (currentPage + 1) * ROWS_PER_PAGE >= window.songData.length;
        }
    };
    
    // Ajouter des écouteurs d'événements pour la pagination
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                window.renderMobileList();
            }
        });
        
        nextButton.addEventListener('click', () => {
            if ((currentPage + 1) * ROWS_PER_PAGE < window.songData.length) {
                currentPage++;
                window.renderMobileList();
            }
        });
    }
    
    // Initialiser le tableau mobile si sur mobile
    if (window.innerWidth < 768 && mobileList) {
        window.renderMobileList();
    }
    
    // Réinitialiser lors du redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768 && mobileList) {
            window.renderMobileList();
        }
    });
}); 