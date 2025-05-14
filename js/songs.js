/**
 * Song management and pagination for Tepper & Bennett
 */
import { loadData } from './data-loader.js';
import { createSongOrgMap, processSongData as processTableData } from './song-utils.js';

// Lazy loading song data - will be initialized when needed
let songDataPromise = null;

/**
 * Lazy initializes the song data by loading all required resources
 * This is only called when actually needed, avoiding unnecessary network calls
 * @returns {Promise<Array>} Promise resolving to the processed song data
 */
function initSongData() {
    // Only initialize once
    if (songDataPromise === null) {
        console.log('Initializing song data lazily');
        
        // Show loading indicators
        showLoadingState(true);
        
        songDataPromise = (async () => {
            try {
                console.log('Loading song data files...');
                
                // Load data files using our improved data-loader
                // which will automatically try YAML first, then JSON
                const elvisSongs = await loadData('elvis-songs');
                const nonElvisSongs = await loadData('non-elvis-songs');
                const songPlays = await loadData('song-plays');
                const performers = await loadData('performers');
                const organizations = await loadData('organizations');
                const rightsAdminSongs = await loadData('rights-admin-songs');
                
                console.log('All data files loaded successfully');
                
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

                // Create song organization map using the shared utility
                const songOrgMap = createSongOrgMap(rightsAdminSongs);
                
                // Combine and process song data
                const allSongs = [...elvisSongs, ...nonElvisSongs];
                
                // Create a map of songs for easier lookup in song plays
                const songsMap = {};
                allSongs.forEach(song => {
                    songsMap[song.code] = song;
                });
                
                // Process song data using the shared utility
                const songData = processTableData(songPlays, songsMap, performersMap, orgsMap, songOrgMap);
                
                console.log('Processed song data:', songData.length, 'songs');
                
                // Hide loading indicators
                showLoadingState(false);
                
                return songData;
            } catch (error) {
                console.error('Error loading song data:', error);
                
                // Hide loading indicators but show error
                showLoadingState(false, true);
                
                // Return empty array instead of fallback data
                return [];
            }
        })();
    }

    return songDataPromise;
}

/**
 * Shows or hides loading state for song data
 * @param {boolean} isLoading Whether data is loading
 * @param {boolean} hasError Whether there was an error loading data
 */
function showLoadingState(isLoading, hasError = false) {
    console.log('Setting loading state:', isLoading, 'hasError:', hasError);
    
    // Desktop loading indicator
    const songsTable = document.getElementById('songs-table');
    if (songsTable) {
        let tbody = songsTable.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            songsTable.appendChild(tbody);
        }
        
        if (isLoading) {
            console.log('Showing loading indicator in table');
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="py-8 text-center">
                        <div class="inline-block animate-pulse">
                            <span class="inline-block">Loading song data...</span>
                        </div>
                    </td>
                </tr>
            `;
        } else if (hasError) {
            console.log('Showing error in table');
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="py-4 text-center text-red-600">
                        <div>
                            <p class="font-bold">Error loading song data</p>
                            <p class="text-sm">Unable to load song data</p>
                        </div>
                    </td>
                </tr>
            `;
        }
        // We no longer clear the tbody when isLoading is false and there's no error
        // This prevents accidentally clearing loaded content
    }
    
    // Mobile loading indicator
    const mobileList = document.getElementById('mobile-songs-list');
    if (mobileList) {
        if (isLoading) {
            console.log('Showing loading indicator in mobile list');
            mobileList.innerHTML = `
                <li class="song-list-entry text-center py-8">
                    <div class="animate-pulse">
                        Loading song data...
                    </div>
                </li>
            `;
        } else if (hasError) {
            console.log('Showing error in mobile list');
            mobileList.innerHTML = `
                <li class="song-list-entry text-center py-4 text-red-600">
                    <div>
                        <p class="font-bold">Error loading song data</p>
                        <p class="text-sm">Unable to load song data</p>
                    </div>
                </li>
            `;
        }
        // We no longer clear the list when isLoading is false and there's no error
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Song search
    const searchInput = document.getElementById('songs-search');
    const searchButton = document.getElementById('search-button');
    
    // Force initialize tables regardless of expansion state
    // This ensures data is always ready when user expands the section
    initSongData().then(songData => {
        // Only render if section is visible
        const songsHeading = document.getElementById('songs-heading');
        const isExpanded = songsHeading && songsHeading.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            renderDesktopTable(songData);
            renderMobileList(songData);
        }
    }).catch(error => {
        console.error('Error initializing song data:', error);
    });
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', async function() {
            const searchTerm = searchInput.value.toLowerCase();
            console.log('Searching for:', searchTerm);
            
            // Show loading state during search
            showLoadingState(true);
            
            // Lazy initialize data and do search
            const songData = await initSongData();
            
            if (searchTerm) {
                const filteredData = songData.filter(song => 
                    song.title.toLowerCase().includes(searchTerm) || 
                    song.performers.toLowerCase().includes(searchTerm) || 
                    song.administrator.toLowerCase().includes(searchTerm)
                );
                
                // Show "no results" if nothing found
                if (filteredData.length === 0) {
                    const songsTable = document.getElementById('songs-table');
                    if (songsTable) {
                        const tbody = songsTable.querySelector('tbody');
                        if (tbody) {
                            tbody.innerHTML = `
                                <tr>
                                    <td colspan="4" class="py-8 text-center">
                                        <div>
                                            <p>No songs found matching "${searchTerm}"</p>
                                            <button id="reset-search" class="btn btn-navy btn-sm mt-2">Show All Songs</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                            
                            document.getElementById('reset-search')?.addEventListener('click', function() {
                                searchInput.value = '';
                                renderDesktopTable(songData);
                                renderMobileList(songData);
                            });
                        }
                    }
                    
                    const mobileList = document.getElementById('mobile-songs-list');
                    if (mobileList) {
                        mobileList.innerHTML = `
                            <li class="song-list-entry text-center py-4">
                                <div>
                                    <p>No songs found matching "${searchTerm}"</p>
                                    <button id="mobile-reset-search" class="btn btn-navy btn-sm mt-2">Show All Songs</button>
                                </div>
                            </li>
                        `;
                        
                        document.getElementById('mobile-reset-search')?.addEventListener('click', function() {
                            searchInput.value = '';
                            renderDesktopTable(songData);
                            renderMobileList(songData);
                        });
                    }
                } else {
                    renderDesktopTable(filteredData);
                    renderMobileList(filteredData);
                }
            } else {
                renderDesktopTable(songData);
                renderMobileList(songData);
            }
        });
        
        // Add search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
    
    // Mobile table pagination
    const ROWS_PER_PAGE = 10;
    let currentPage = 0;
    
    const mobileList = document.getElementById('mobile-songs-list');
    const prevButton = document.getElementById('mobile-prev-page');
    const nextButton = document.getElementById('mobile-next-page');
    
    // Function to render the mobile list
    async function renderMobileList(songs) {
        if (!mobileList) return;
        
        // If no songs were passed, load them lazily
        if (!songs) {
            songs = await initSongData();
        }
        
        // Reset pagination when showing a new set of data
        if (currentPage !== 0) {
            currentPage = 0;
        }
        
        mobileList.innerHTML = '';
        
        const start = currentPage * ROWS_PER_PAGE;
        const end = Math.min(start + ROWS_PER_PAGE, songs.length);
        const pageData = songs.slice(start, end);
        
        // Add pagination info
        if (songs.length > ROWS_PER_PAGE) {
            const paginationInfo = document.createElement('li');
            paginationInfo.className = 'song-list-pagination-info text-center text-sm text-gray-600 mb-2';
            paginationInfo.textContent = `Showing ${start + 1}-${end} of ${songs.length} songs`;
            mobileList.appendChild(paginationInfo);
        }
        
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
            nextButton.disabled = (currentPage + 1) * ROWS_PER_PAGE >= songs.length;
        }
    }
    
    // Function to render the desktop table
    async function renderDesktopTable(songs) {
        const songsTable = document.getElementById('songs-table');
        if (!songsTable) {
            console.error('Songs table element not found!');
            return;
        }
        
        console.log('Rendering desktop table with', songs ? songs.length : 0, 'songs');
        
        // If no songs were passed, load them lazily
        if (!songs) {
            songs = await initSongData();
        }
        
        if (!Array.isArray(songs) || songs.length === 0) {
            console.warn('No songs data available to render in desktop table');
        }
        
        // Get the table body or create one if it doesn't exist
        let tbody = songsTable.querySelector('tbody');
        if (!tbody) {
            console.log('Creating new tbody element');
            tbody = document.createElement('tbody');
            songsTable.appendChild(tbody);
        } else {
            console.log('Clearing existing tbody content');
            tbody.innerHTML = '';
        }
        
        // Add song count summary
        const countRow = document.createElement('tr');
        countRow.innerHTML = `
            <td colspan="4" class="py-2 px-4 text-sm text-gray-600 bg-gray-50">
                Displaying ${songs.length} song${songs.length !== 1 ? 's' : ''}
            </td>
        `;
        tbody.appendChild(countRow);
        
        // Build table rows
        songs.forEach((song, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="py-3 px-4"><a href="#songs" class="site-link">${song.title || 'Unknown Title'}</a></td>
                <td class="py-3 px-4">${song.performers || 'Unknown Performer'}</td>
                <td class="py-3 px-4">${song.administrator || 'Unknown'}</td>
                <td class="py-3 px-4 text-center">
                    <a href="${song.youtubeUrl || '#'}" target="_blank" class="text-red-600 hover:text-red-800">▶</a>
                </td>
            `;
            
            tbody.appendChild(row);
            
            if (index === 0) {
                console.log('First song rendered:', song);
            }
        });
        
        console.log('Finished rendering desktop table');
    }
    
    // Add event listeners for pagination
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', async () => {
            if (currentPage > 0) {
                const songs = await initSongData();
                currentPage--;
                renderMobileList(songs);
            }
        });
        
        nextButton.addEventListener('click', async () => {
            const songs = await initSongData();
            if ((currentPage + 1) * ROWS_PER_PAGE < songs.length) {
                currentPage++;
                renderMobileList(songs);
            }
        });
    }
    
    // Only initialize the song table when the songs heading is expanded
    const songsHeading = document.getElementById('songs-heading');
    if (songsHeading) {
        songsHeading.addEventListener('click', async function() {
            // Check if content is being expanded
            const willBeExpanded = this.getAttribute('aria-expanded') === 'false';
            console.log('Songs section clicked, willBeExpanded:', willBeExpanded);
            
            if (willBeExpanded) {
                console.log('Songs section will be expanded, initializing tables');
                // Initialize tables when expanded
                try {
                    const songData = await initSongData();
                    renderDesktopTable(songData);
                    renderMobileList(songData);
                } catch (error) {
                    console.error('Error initializing tables on section expansion:', error);
                }
            }
        });
    }
    
    // If songs section is already expanded on load, initialize the tables
    if (songsHeading && songsHeading.getAttribute('aria-expanded') === 'true') {
        console.log('Songs section is already expanded on load, initializing tables');
        Promise.all([renderDesktopTable(), renderMobileList()]).catch(error => {
            console.error('Error initializing tables on already expanded section:', error);
        });
    }
    
    // Initialize mobile table if on mobile
    if (window.innerWidth < 768 && mobileList) {
        renderMobileList();
    }
    
    // Reset on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768 && mobileList) {
            renderMobileList();
        }
    });
}); 