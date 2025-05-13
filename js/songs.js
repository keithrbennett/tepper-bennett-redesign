/**
 * Song management and mobile pagination for Tepper & Bennett
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Song search
    const searchInput = document.getElementById('songs-search');
    const searchButton = document.getElementById('search-button');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.toLowerCase();
            console.log('Searching for:', searchTerm);
            // Add search functionality here
        });
    }
    
    // Load song data from YAML files
    try {
        // Load songs data
        const elvisSongs = await window.dataLoader.loadData('elvis-songs.yml');
        const nonElvisSongs = await window.dataLoader.loadData('non-elvis-songs.yml');
        const songPlays = await window.dataLoader.loadData('song-plays.yml');
        const performers = await window.dataLoader.loadData('performers.yml');
        const organizations = await window.dataLoader.loadData('organizations.yml');
        
        // Create a map of performers for easier lookup
        const performersMap = {};
        performers.forEach(performer => {
            performersMap[performer.code] = performer.name;
        });
        
        // Create a map of admin organizations for easier lookup
        const orgsMap = {};
        organizations.forEach(org => {
            orgsMap[org.code] = org.name;
        });

        // Combine and process song data
        const allSongs = [...elvisSongs, ...nonElvisSongs];
        
        // Create a map of songs for easier lookup in song plays
        const songsMap = {};
        allSongs.forEach(song => {
            songsMap[song.code] = song;
        });
        
        // Build song data for the table
        window.songData = songPlays.map(play => {
            const song = songsMap[play.song_code];
            const performer = performersMap[play.performer_codes] || play.performer_codes;
            
            return {
                title: song ? song.name : play.song_code,
                performers: performer,
                administrator: song && song.organization ? orgsMap[song.organization] : 'Unknown',
                youtubeUrl: play.youtube_key ? `https://www.youtube.com/watch?v=${play.youtube_key}` : '#'
            };
        });
        
        console.log('Loaded song data:', window.songData.length, 'songs');
    } catch (error) {
        console.error('Error loading song data:', error);
        
        // Fallback to hardcoded data if loading fails
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
            // Add more songs here when they become available
        ];
    }
    
    // Mobile table pagination
    const ROWS_PER_PAGE = 10;
    let currentPage = 0;
    
    const mobileList = document.getElementById('mobile-songs-list');
    const prevButton = document.getElementById('mobile-prev-page');
    const nextButton = document.getElementById('mobile-next-page');
    
    // Function to render the mobile list
    window.renderMobileList = function() {
        if (!mobileList) return;
        
        mobileList.innerHTML = '';
        
        const start = currentPage * ROWS_PER_PAGE;
        const end = Math.min(start + ROWS_PER_PAGE, window.songData.length);
        const pageData = window.songData.slice(start, end);
        
        pageData.forEach(song => {
            const listItem = document.createElement('li');
            listItem.className = 'song-list-entry';
            
            // Truncate long texts for mobile
            const truncateText = (text, maxLength = 20) => {
                if (!text) return '';
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
        
        // Update pagination buttons
        if (prevButton && nextButton) {
            prevButton.disabled = currentPage === 0;
            nextButton.disabled = (currentPage + 1) * ROWS_PER_PAGE >= window.songData.length;
        }
    };
    
    // Add event listeners for pagination
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
    
    // Initialize mobile table if on mobile
    if (window.innerWidth < 768 && mobileList) {
        window.renderMobileList();
    }
    
    // Reset on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768 && mobileList) {
            window.renderMobileList();
        }
    });
}); 