/**
 * Data loader for Tepper & Bennett song information
 * Loads and processes song data from YAML files for display in the songs table
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Data loader: starting');
  
  // Flag to track initial page load
  window.initialLoadComplete = false;
  
  // Reference to the table
  const songlistTable = document.getElementById('songlist-table');
  if (!songlistTable) {
    console.error('Songs table not found');
    return;
  }
  
  // Mobile table pagination
  const ROWS_PER_PAGE = 10;
  let currentPage = 0;
  
  // Desktop table pagination
  const DESKTOP_ROWS_PER_PAGE = 25;
  let currentDesktopPage = 0;
  
  const mobileList = document.getElementById('mobile-songs-list');
  const prevButton = document.getElementById('mobile-prev-page');
  const nextButton = document.getElementById('mobile-next-page');
  
  // Desktop pagination elements
  const desktopPrevButton = document.getElementById('desktop-prev-page');
  const desktopNextButton = document.getElementById('desktop-next-page');
  const desktopFirstButton = document.getElementById('desktop-first-page');
  const desktopLastButton = document.getElementById('desktop-last-page');
  const desktopPageInfo = document.getElementById('desktop-page-info');
  
  // Upper desktop pagination elements
  const upperDesktopPrevButton = document.getElementById('upper-desktop-prev-page');
  const upperDesktopNextButton = document.getElementById('upper-desktop-next-page');
  const upperDesktopFirstButton = document.getElementById('upper-desktop-first-page');
  const upperDesktopLastButton = document.getElementById('upper-desktop-last-page');
  const upperDesktopPageInfo = document.getElementById('upper-desktop-page-info');
  
  // Song search elements
  const searchInput = document.getElementById('songs-search');
  const searchButton = document.getElementById('search-button');
  const searchContainer = document.querySelector('.search-container');
  
  // Show loading indicator
  const tbody = songlistTable.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center">
          <div class="inline-block animate-pulse">
            <span class="inline-block">Loading song data...</span>
          </div>
        </td>
      </tr>
    `;
  }
  
  // Check if fetch is supported
  if (!window.fetch) {
    console.error('Fetch API is not supported in this browser');
    showError('Your browser does not support modern web features required by this application. Please use a current version of Chrome, Firefox, Safari, or Edge.');
    return;
  }
  
  // Utility functions (from song-utils.js)
  /**
   * Creates a mapping of song codes to organization codes
   * @param {Object} rightsAdminSongs - The rights admin data from rights-admin-songs.yml
   * @returns {Object} A map of song codes to organization codes
   */
  function createSongOrgMap(rightsAdminSongs) {
    console.log('Creating song organization map');
    const songOrgMap = {};
    
    Object.keys(rightsAdminSongs).forEach(orgCode => {
      const songCodes = rightsAdminSongs[orgCode];
      songCodes.forEach(songCode => {
        songOrgMap[songCode] = orgCode;
      });
    });
    
    console.log('Song organization map created with', Object.keys(songOrgMap).length, 'entries');
    return songOrgMap;
  }

  /**
   * Processes song data to create the final data structure for the table
   * @param {Array} songPlays - Song plays data
   * @param {Object} songsMap - Map of song codes to song objects
   * @param {Object} performersMap - Map of performer codes to performer names
   * @param {Object} orgsMap - Map of organization codes to organization names
   * @param {Object} songOrgMap - Map of song codes to organization codes
   * @returns {Array} Processed song data for the table
   */
  function processTableData(songPlays, songsMap, performersMap, orgsMap, songOrgMap) {
    return songPlays.map(play => {
      const song = songsMap[play.song_code];
      // Ensure performer is always a string
      const performer = String(performersMap[play.performer_codes] || play.performer_codes || 'Unknown Performer');
      
      // Get organization from the song organization map
      const orgCode = songOrgMap[play.song_code];
      // Ensure administrator is always a string
      const administrator = String(orgCode ? orgsMap[orgCode] : 'Unknown');
      
      return {
        title: String(song ? song.name : play.song_code || 'Unknown Title'),
        performers: performer,
        administrator: administrator,
        youtubeUrl: play.youtube_key ? `https://www.youtube.com/watch?v=${play.youtube_key}` : '#'
      };
    });
  }
  
  // Simplify to use just one known path instead of trying multiple paths
  const dataPath = 'data/'; // This is the standard location relative to serving root
  
  console.log('Using data path:', dataPath);
  console.log('Current location:', window.location.href);
  
  // List of files to load
  const fileNames = [
    'song-plays.yml',
    'elvis-songs.yml', 
    'non-elvis-songs.yml',
    'performers.yml',
    'organizations.yml',
    'rights-admin-songs.yml'
  ];
  
  // Store loaded song data for reuse
  let loadedSongData = null;
  let filteredSongData = null;
  
  // Expose data to global scope for sorting
  window.loadedSongData = null;
  window.filteredSongData = null;
  
  // Load the data
  loadSongData();
  
  /**
   * Main function to load song data
   */
  function loadSongData() {
    // Debug info in the console
    console.log('======= DEBUG INFO =======');
    console.log('Document URL:', document.URL);
    console.log('Base URI:', document.baseURI);
    console.log('jsyaml available:', !!window.jsyaml);
    if (window.jsyaml) {
      console.log('jsyaml version:', window.jsyaml.version);
    }
    console.log('==========================');
    
    // Load data using fetch
    loadData()
      .catch(error => {
        console.error('Data loading failed:', error);
        showError(`Failed to load data: ${error.message}. Please check that you're accessing this site through a web server.`);
      });
  }
  
  /**
   * Load data using fetch API
   */
  function loadData() {
    console.log('Loading data via fetch from', dataPath);
    return loadAllFiles(dataPath);
  }
  
  /**
   * Load all files using the specified path
   */
  function loadAllFiles(basePath) {
    console.log(`Attempting to load files from ${basePath}`);
    
    const loadPromises = fileNames.map(fileName => {
      const fullPath = basePath + fileName;
      console.log(`Loading ${fullPath}`);
      
      return loadYamlFile(fullPath)
        .catch(error => {
          console.error(`Error loading ${fullPath}:`, error);
          throw new Error(`Failed to load ${fileName}: ${error.message}`);
        });
    });
    
    return Promise.all(loadPromises)
      .then(([songPlays, elvisSongs, nonElvisSongs, performers, organizations, rightsAdminSongs]) => {
        if (!songPlays || !songPlays.length) {
          throw new Error('Song plays data is empty or invalid');
        }
        
        console.log('All files loaded successfully:');
        console.log('- song-plays.yml:', songPlays.length, 'entries');
        console.log('- elvis-songs.yml:', elvisSongs.length, 'entries');
        console.log('- non-elvis-songs.yml:', nonElvisSongs.length, 'entries');
        console.log('- performers.yml:', performers.length, 'entries');
        console.log('- organizations.yml:', organizations.length, 'entries');
        console.log('- rights-admin-songs.yml:', Object.keys(rightsAdminSongs).length, 'organizations');
        
        processSongData(songPlays, elvisSongs, nonElvisSongs, performers, organizations, rightsAdminSongs);
        return true;
      });
  }
  
  /**
   * Process the loaded data and render the table
   */
  function processSongData(songPlays, elvisSongs, nonElvisSongs, performers, organizations, rightsAdminSongs) {
    console.log('All YAML files successfully loaded');
    
    // Create maps for easier lookup
    const performersMap = {};
    performers.forEach(performer => {
      performersMap[performer.code] = performer.name;
    });
    
    const orgsMap = {};
    organizations.forEach(org => {
      orgsMap[org.code] = org.name;
    });
    
    // Create song organization map using the local utility function
    const songOrgMap = createSongOrgMap(rightsAdminSongs);
    
    // Combine song data
    const allSonglist = [...elvisSongs, ...nonElvisSongs];
    const songlistMap = {};
    allSonglist.forEach(song => {
      songlistMap[song.code] = song;
    });
    
    // Process song data using the local utility function
    const songlistData = processTableData(songPlays, songlistMap, performersMap, orgsMap, songOrgMap);
    
    console.log(`Song data processed: ${songlistData.length} songlist`);
    
    // Store the processed data for reuse
    loadedSongData = songlistData;
    filteredSongData = songlistData;
    
    // Also assign to window for global access
    window.loadedSongData = songlistData;
    window.filteredSongData = songlistData;
    
    // Initialize pagination module
    if (window.tablePagination) {
      window.tablePagination.initPagination(songlistData);
    }
    
    // Initialize search handler with the song data
    if (window.searchHandler) {
      window.searchHandler.initSearch(songlistData);
    } else {
      // Fallback to legacy search if search handler module is not available
      setupSearch(songlistData);
    }
    
    // Render the table and mobile list
    if (window.renderTable) {
      window.renderTable(songlistData);
    } else {
      renderTable(songlistData);
    }
    
    if (window.renderMobileList) {
      window.renderMobileList(songlistData);
    } else {
      renderMobileList(songlistData);
    }
    
    // Initialize sortable headers
    if (typeof window.initSortableHeaders === 'function') {
      console.log('Initializing sortable headers');
      window.initSortableHeaders();
    }
  }
  
  /**
   * Set up search functionality
   * @param {Array} songData - The full song data array
   */
  function setupSearch(songData) {
    console.log('Setting up search functionality');
    // Only use the legacy search if the search handler module is not available
    if (!window.searchHandler) {
      console.log('Search handler module not found, using legacy search');
      // Legacy search function as fallback
      if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
          performSearch(songData);
        });
        
        // Add search on Enter key
        searchInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            performSearch(songData);
          }
        });
      }
    } else {
      console.log('Search handler module found, skipping legacy search setup');
    }
  }
  
  /**
   * Perform search on song data
   * @param {Array} songData - The full song data array
   */
  function performSearch(songData) {
    if (!searchInput) {
      console.error('Search input element not found');
      return;
    }
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    console.log('Searching for:', searchTerm);
    
    if (searchTerm) {
      try {
        const filteredData = songData.filter(song => {
          // Ensure all values are strings before calling toLowerCase()
          const title = String(song.title || '').toLowerCase();
          const performers = String(song.performers || '').toLowerCase();
          const administrator = String(song.administrator || '').toLowerCase();
          
          return title.includes(searchTerm) || 
                 performers.includes(searchTerm) || 
                 administrator.includes(searchTerm);
        });
        
        // Show "no results" if nothing found
        if (filteredData.length === 0) {
          if (songlistTable) {
            const tbody = songlistTable.querySelector('tbody');
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
              
              setTimeout(() => {
                const resetButton = document.getElementById('reset-search');
                if (resetButton) {
                  resetButton.addEventListener('click', function() {
                    searchInput.value = '';
                    currentPage = 0;
                    currentDesktopPage = 0;
                    filteredSongData = songData;
                    window.filteredSongData = songData;
                    renderTable(songData);
                    renderMobileList(songData);
                  });
                }
              }, 0);
            }
          }
          
          if (mobileList) {
            mobileList.innerHTML = `
              <li class="song-list-entry text-center py-4">
                <div>
                  <p>No songs found matching "${searchTerm}"</p>
                  <button id="mobile-reset-search" class="btn btn-navy btn-sm mt-2">Show All Songs</button>
                </div>
              </li>
            `;
            
            setTimeout(() => {
              const mobileResetButton = document.getElementById('mobile-reset-search');
              if (mobileResetButton) {
                mobileResetButton.addEventListener('click', function() {
                  searchInput.value = '';
                  currentPage = 0;
                  currentDesktopPage = 0;
                  filteredSongData = songData;
                  window.filteredSongData = songData;
                  renderTable(songData);
                  renderMobileList(songData);
                });
              }
            }, 0);
          }
        } else {
          // Reset pagination when searching
          currentPage = 0;
          currentDesktopPage = 0;
          filteredSongData = filteredData;
          window.filteredSongData = filteredData;
          renderTable(filteredData);
          renderMobileList(filteredData);
        }
      } catch (error) {
        console.error('Error during search:', error);
      }
    } else {
      // Reset pagination when clearing search
      currentPage = 0;
      currentDesktopPage = 0;
      filteredSongData = songData;
      window.filteredSongData = songData;
      renderTable(songData);
      renderMobileList(songData);
    }
  }
  
  /**
   * Load a YAML file
   * @param {string} url - URL of the YAML file
   * @returns {Promise<any>} - Promise resolving to parsed data
   */
  function loadYamlFile(url) {
    console.log(`Loading ${url}`);
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status} for ${url}`);
        }
        return response.text();
      })
      .then(text => {
        if (!window.jsyaml) {
          throw new Error('js-yaml library is not loaded');
        }
        
        try {
          const data = window.jsyaml.load(text);
          console.log(`File ${url} loaded successfully:`, data ? (Array.isArray(data) ? data.length : 'object') : 'empty', 'items');
          return data;
        } catch (e) {
          console.error(`Error parsing YAML for ${url}:`, e);
          throw new Error(`Error parsing YAML for ${url}: ${e.message}`);
        }
      });
  }
  
  /**
   * Display an error message in the table
   * @param {string} message - Error message
   */
  function showError(message) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="py-4 text-center text-red-600">
            <div>
              <p class="font-bold">Error loading data</p>
              <p class="text-sm">${message}</p>
              <p class="text-sm mt-2">Please make sure you're accessing this site through a web server (http://localhost:8000) and not directly from a file.</p>
            </div>
          </td>
        </tr>
      `;
    }
    
    // Also show error in mobile view
    if (mobileList) {
      mobileList.innerHTML = `
        <li class="song-list-entry text-center py-4 text-red-600">
          <div>
            <p class="font-bold">Error loading data</p>
            <p class="text-sm">${message}</p>
          </div>
        </li>
      `;
    }
  }
  
  /**
   * Render the table with the provided data
   * @param {Array} songs - Array of song objects
   */
  function renderTable(songs) {
    console.log("Song count: " + songs.length);
    
    // Get or create the tbody element
    let tbody = songlistTable.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      songlistTable.appendChild(tbody);
    } else {
      tbody.innerHTML = '';
    }
    
    // Calculate pagination for desktop
    const start = currentDesktopPage * DESKTOP_ROWS_PER_PAGE;
    const end = Math.min(start + DESKTOP_ROWS_PER_PAGE, songs.length);
    const pageData = songs.slice(start, end);
    
    // Update desktop pagination info and buttons
    updateDesktopPagination(songs, start, end);
    
    // Add each song to the table
    pageData.forEach(song => {
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
    });
    
    console.log('Table rendered successfully');
  }
  
  /**
   * Update desktop pagination information and button states
   * @param {Array} songs - Full array of songs (filtered or not)
   * @param {number} start - Start index of current page
   * @param {number} end - End index of current page
   */
  function updateDesktopPagination(songs, start, end) {
    const totalPages = Math.ceil(songs.length / DESKTOP_ROWS_PER_PAGE);
    const currentPageNumber = currentDesktopPage + 1;
    const isFirstPage = currentDesktopPage === 0;
    const isLastPage = end >= songs.length;
    
    // Create page info text
    let pageInfoText;
    if (songs.length <= DESKTOP_ROWS_PER_PAGE) {
      pageInfoText = `Showing all ${songs.length} song${songs.length !== 1 ? 's' : ''}`;
    } else {
      pageInfoText = `Page ${currentPageNumber} of ${totalPages} (${start + 1}-${end} of ${songs.length} songs)`;
    }
    
    // Update lower pagination controls
    if (desktopPageInfo) {
      desktopPageInfo.textContent = pageInfoText;
      
      // Update button states
      if (desktopFirstButton) desktopFirstButton.disabled = isFirstPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
      if (desktopPrevButton) desktopPrevButton.disabled = isFirstPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
      if (desktopNextButton) desktopNextButton.disabled = isLastPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
      if (desktopLastButton) desktopLastButton.disabled = isLastPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
    }
    
    // Update upper pagination controls
    if (upperDesktopPageInfo) {
      upperDesktopPageInfo.textContent = pageInfoText;
      
      // Update button states
      if (upperDesktopFirstButton) upperDesktopFirstButton.disabled = isFirstPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
      if (upperDesktopPrevButton) upperDesktopPrevButton.disabled = isFirstPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
      if (upperDesktopNextButton) upperDesktopNextButton.disabled = isLastPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
      if (upperDesktopLastButton) upperDesktopLastButton.disabled = isLastPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
    }
  }
  
  /**
   * Function to render the mobile list
   * @param {Array} songs - Array of song objects
   */
  function renderMobileList(songs) {
    if (!mobileList) return;
    
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
  
  // Add event listeners for pagination
  if (prevButton && nextButton) {
    prevButton.addEventListener('click', () => {
      if (currentPage > 0 && filteredSongData) {
        currentPage--;
        renderMobileList(filteredSongData);
      }
    });
    
    nextButton.addEventListener('click', () => {
      if (filteredSongData && (currentPage + 1) * ROWS_PER_PAGE < filteredSongData.length) {
        currentPage++;
        renderMobileList(filteredSongData);
      }
    });
  }
  
  // Add event listeners for desktop pagination
  if (desktopPrevButton && desktopNextButton) {
    desktopPrevButton.addEventListener('click', () => {
      if (currentDesktopPage > 0 && filteredSongData) {
        currentDesktopPage--;
        renderTable(filteredSongData);
      }
    });
    
    desktopNextButton.addEventListener('click', () => {
      if (filteredSongData && (currentDesktopPage + 1) * DESKTOP_ROWS_PER_PAGE < filteredSongData.length) {
        currentDesktopPage++;
        renderTable(filteredSongData);
      }
    });
  }
  
  // Add event listeners for first and last page buttons
  if (desktopFirstButton && desktopLastButton) {
    desktopFirstButton.addEventListener('click', () => {
      if (currentDesktopPage > 0 && filteredSongData) {
        currentDesktopPage = 0;
        renderTable(filteredSongData);
      }
    });
    
    desktopLastButton.addEventListener('click', () => {
      if (filteredSongData) {
        const lastPage = Math.max(0, Math.ceil(filteredSongData.length / DESKTOP_ROWS_PER_PAGE) - 1);
        if (currentDesktopPage !== lastPage) {
          currentDesktopPage = lastPage;
          renderTable(filteredSongData);
        }
      }
    });
  }
  
  // Add event listeners for upper desktop pagination
  if (upperDesktopPrevButton && upperDesktopNextButton) {
    upperDesktopPrevButton.addEventListener('click', () => {
      if (currentDesktopPage > 0 && filteredSongData) {
        currentDesktopPage--;
        renderTable(filteredSongData);
      }
    });
    
    upperDesktopNextButton.addEventListener('click', () => {
      if (filteredSongData && (currentDesktopPage + 1) * DESKTOP_ROWS_PER_PAGE < filteredSongData.length) {
        currentDesktopPage++;
        renderTable(filteredSongData);
      }
    });
  }
  
  // Add event listeners for upper first and last page buttons
  if (upperDesktopFirstButton && upperDesktopLastButton) {
    upperDesktopFirstButton.addEventListener('click', () => {
      if (currentDesktopPage > 0 && filteredSongData) {
        currentDesktopPage = 0;
        renderTable(filteredSongData);
      }
    });
    
    upperDesktopLastButton.addEventListener('click', () => {
      if (filteredSongData) {
        const lastPage = Math.max(0, Math.ceil(filteredSongData.length / DESKTOP_ROWS_PER_PAGE) - 1);
        if (currentDesktopPage !== lastPage) {
          currentDesktopPage = lastPage;
          renderTable(filteredSongData);
        }
      }
    });
  }
  
  // Listen for section expansion
  const songlistHeading = document.getElementById('songlist-heading');
  if (songlistHeading) {
    songlistHeading.addEventListener('click', function() {
      // Check if content is being expanded
      const willBeExpanded = this.getAttribute('aria-expanded') === 'false';
      console.log('Song List section clicked, willBeExpanded:', willBeExpanded);
      
      if (willBeExpanded && filteredSongData) {
        console.log('Song List section will be expanded, rendering tables');
        renderTable(filteredSongData);
        renderMobileList(filteredSongData);
      }
    });
  }
  
  // Handle responsive behavior
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768 && mobileList && filteredSongData) {
      renderMobileList(filteredSongData);
    } else if (window.innerWidth >= 768 && songlistTable && filteredSongData) {
      renderTable(filteredSongData);
    }
  });
  
  // Mark initial load as complete after a delay
  setTimeout(() => {
    window.initialLoadComplete = true;
    console.log('Initial page load completed, scroll behavior enabled');
  }, 1500);
}); 