/**
 * Data loader for Tepper & Bennett song information
 * Loads and processes song data from YAML files for display in the songs table
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Data loader: starting');
  
  // Reference to the table
  const songsTable = document.getElementById('songs-table');
  if (!songsTable) {
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
  const tbody = songsTable.querySelector('tbody');
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
      const performer = performersMap[play.performer_codes] || play.performer_codes;
      
      // Get organization from the song organization map
      const orgCode = songOrgMap[play.song_code];
      const administrator = orgCode ? orgsMap[orgCode] : 'Unknown';
      
      return {
        title: song ? song.name : play.song_code,
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
    const allSongs = [...elvisSongs, ...nonElvisSongs];
    const songsMap = {};
    allSongs.forEach(song => {
      songsMap[song.code] = song;
    });
    
    // Process song data using the local utility function
    const songData = processTableData(songPlays, songsMap, performersMap, orgsMap, songOrgMap);
    
    console.log(`Song data processed: ${songData.length} songs`);
    
    // Store the processed data for reuse
    loadedSongData = songData;
    filteredSongData = songData;
    
    // Render the table and mobile list
    renderTable(songData);
    renderMobileList(songData);
    
    // Set up search functionality
    setupSearch(songData);
  }
  
  /**
   * Set up search functionality
   * @param {Array} songData - The full song data array
   */
  function setupSearch(songData) {
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
  }
  
  /**
   * Perform search on song data
   * @param {Array} songData - The full song data array
   */
  function performSearch(songData) {
    const searchTerm = searchInput.value.toLowerCase();
    console.log('Searching for:', searchTerm);
    
    if (searchTerm) {
      const filteredData = songData.filter(song => 
        song.title.toLowerCase().includes(searchTerm) || 
        song.performers.toLowerCase().includes(searchTerm) || 
        song.administrator.toLowerCase().includes(searchTerm)
      );
      
      // Show "no results" if nothing found
      if (filteredData.length === 0) {
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
              currentPage = 0;
              currentDesktopPage = 0;
              filteredSongData = songData;
              renderTable(songData);
              renderMobileList(songData);
            });
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
          
          document.getElementById('mobile-reset-search')?.addEventListener('click', function() {
            searchInput.value = '';
            currentPage = 0;
            currentDesktopPage = 0;
            filteredSongData = songData;
            renderTable(songData);
            renderMobileList(songData);
          });
        }
      } else {
        // Reset pagination when searching
        currentPage = 0;
        currentDesktopPage = 0;
        filteredSongData = filteredData;
        renderTable(filteredData);
        renderMobileList(filteredData);
      }
    } else {
      // Reset pagination when clearing search
      currentPage = 0;
      currentDesktopPage = 0;
      filteredSongData = songData;
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
    let tbody = songsTable.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      songsTable.appendChild(tbody);
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
    
    // Scroll to the top of the table
    scrollToTable();
    
    console.log('Table rendered successfully');
  }
  
  /**
   * Scrolls the window to the top of the table container
   */
  function scrollToTable() {
    const searchSection = document.querySelector('.search-container');
    if (searchSection) {
      // Scroll to show the search bar and upper pagination controls
      setTimeout(() => {
        searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
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
    
    // Scroll to the top of the mobile list
    scrollToMobileList();
  }
  
  /**
   * Scrolls the window to the top of the mobile list
   */
  function scrollToMobileList() {
    if (mobileList) {
      // Use a slight delay to ensure the DOM has updated
      setTimeout(() => {
        mobileList.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
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
  const songsHeading = document.getElementById('songs-heading');
  if (songsHeading) {
    songsHeading.addEventListener('click', function() {
      // Check if content is being expanded
      const willBeExpanded = this.getAttribute('aria-expanded') === 'false';
      console.log('Songs section clicked, willBeExpanded:', willBeExpanded);
      
      if (willBeExpanded && filteredSongData) {
        console.log('Songs section will be expanded, rendering tables');
        renderTable(filteredSongData);
        renderMobileList(filteredSongData);
      }
    });
  }
  
  // Handle responsive behavior
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768 && mobileList && filteredSongData) {
      renderMobileList(filteredSongData);
    } else if (window.innerWidth >= 768 && songsTable && filteredSongData) {
      renderTable(filteredSongData);
    }
  });
}); 