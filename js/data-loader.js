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
  
  // Store data references
  let loadedSongData = null;
  window.loadedSongData = null;
  let listJsInstance = null;
  
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
    
    console.log(`Song data processed: ${songlistData.length} songs`);
    
    // Store the processed data for reuse
    loadedSongData = songlistData;
    window.loadedSongData = songlistData;
    
    // Initialize List.js
    initializeListJs(songlistData);
  }
  
  /**
   * Initialize List.js with song data
   * @param {Array} songData - Processed song data
   */
  function initializeListJs(songData) {
    console.log('Initializing List.js with', songData.length, 'songs');
    
    // Wait for DOM to be fully ready
    setTimeout(() => {
      try {
        // Get the container element
        const container = document.getElementById('songlist-listjs-container');
        if (!container) {
          console.error('Container element not found');
          showError('Table container element not found');
          return;
        }
        
        // Check if List.js library is available
        if (typeof window.List !== 'function') {
          console.error('List.js library not loaded');
          showError('Required library List.js is not loaded. Please check your internet connection and reload the page.');
          return;
        }
        
        // Completely recreate the table structure for List.js
        container.innerHTML = `
          <div class="list-controls mb-4">
            <input class="search form-control w-full p-3 border border-gray-300 rounded-md" 
              placeholder="Search songs, performers, and administrators, e.g.: elvis" 
              aria-label="Search songs">
          </div>
          
          <table id="songlist-table" class="min-w-full bg-white">
            <thead class="bg-navy text-white">
              <tr>
                <th class="py-3 px-4 text-left sort" data-sort="title">Title</th>
                <th class="py-3 px-4 text-left sort" data-sort="performers">Performer(s)</th>
                <th class="py-3 px-4 text-left sort" data-sort="administrator">Rights Administrator</th>
                <th class="py-3 px-4 text-center">YouTube</th>
              </tr>
            </thead>
            <tbody class="list">
              <!-- Table content will be populated by List.js -->
            </tbody>
          </table>
          
          <div class="pagination-wrapper my-4">
            <div class="pagination-controls flex justify-between items-center">
              <div class="pagination"></div>
              <div class="rows-per-page-container"></div>
            </div>
          </div>
        `;
        
        // Add rows-per-page control
        const rowsPerPageContainer = container.querySelector('.rows-per-page-container');
        if (rowsPerPageContainer) {
          const template = document.getElementById('rows-per-page-template');
          if (template) {
            const rowsPerPageControl = template.content.cloneNode(true);
            rowsPerPageContainer.appendChild(rowsPerPageControl);
          }
        }
        
        // Convert the data for List.js
        const listData = songData.map(song => ({
          title: song.title || 'Unknown Title',
          performers: song.performers || 'Unknown Performer',
          administrator: song.administrator || 'Unknown',
          youtube: `<a href="${song.youtubeUrl || '#'}" class="text-red-600 hover:text-red-800" target="_blank">▶</a>`
        }));
        
        // Options for List.js
        const options = {
          valueNames: ['title', 'performers', 'administrator', 'youtube'],
          item: `<tr>
                  <td class="title py-3 px-4"></td>
                  <td class="performers py-3 px-4"></td>
                  <td class="administrator py-3 px-4"></td>
                  <td class="youtube py-3 px-4 text-center"></td>
                </tr>`,
          page: window.tbConfig?.pagination?.desktop?.defaultRowsPerPage || 15,
          pagination: {
            name: "pagination",
            paginationClass: "pagination",
            outerWindow: 1,
            innerWindow: 2,
            left: 2,
            right: 2
          }
        };
        
        // Initialize List.js
        const list = new List(container, options, listData);
        
        // Store reference for later use
        listJsInstance = list;
        
        // Setup rows per page control
        setupRowsPerPage();
        
        // Fix pagination to prevent scrolling to top
        preventPaginationScroll();
        
        // Initial UI update
        updateUI();
        
        // Add event listener for List.js updates
        list.on('updated', function() {
          console.log('List.js updated, refreshing UI');
          updateUI();
          
          // Re-apply pagination fix after list update
          preventPaginationScroll();
        });
        
        console.log('List.js initialized successfully with', list.size(), 'items');
      } catch (error) {
        console.error('Error initializing List.js:', error);
        showError(`Failed to initialize table: ${error.message}`);
      }
    }, 100); // Small delay to ensure DOM is ready
  }
  
  /**
   * Prevent pagination links from scrolling to top of page
   */
  function preventPaginationScroll() {
    setTimeout(() => {
      const paginationLinks = document.querySelectorAll('.pagination li a');
      paginationLinks.forEach(link => {
        if (!link._hasClickHandler) {
          link._hasClickHandler = true;
          link.addEventListener('click', function(e) {
            // Prevent default anchor behavior that causes page scroll
            e.preventDefault();
            
            // The click will still bubble to List.js's handlers
            // and trigger the page change correctly
          });
        }
      });
    }, 100);
  }
  
  /**
   * Setup rows per page dropdown to work with List.js
   */
  function setupRowsPerPage() {
    const rowsPerPageSelects = document.querySelectorAll('.rows-per-page-select');
    
    if (!rowsPerPageSelects.length) {
      console.warn('No rows-per-page-select elements found');
      return;
    }
    
    // Get options from config
    const options = window.tbConfig?.pagination?.desktop?.rowsPerPageOptions || [10, 15, 20, 50, 100];
    const defaultValue = window.tbConfig?.pagination?.desktop?.defaultRowsPerPage || 15;
    
    // Populate the selects with options
    rowsPerPageSelects.forEach(select => {
      // Clear existing options
      select.innerHTML = '';
      
      // Add options from config
      options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        optionElement.selected = option === defaultValue;
        select.appendChild(optionElement);
      });
      
      // Add change event listener
      select.addEventListener('change', function() {
        const value = parseInt(this.value, 10);
        if (listJsInstance && !isNaN(value)) {
          // Update list.js page size
          listJsInstance.page = value;
          listJsInstance.update();
          
          // Update all other selects to match
          rowsPerPageSelects.forEach(otherSelect => {
            if (otherSelect !== this) {
              otherSelect.value = value;
            }
          });
          
          console.log('Rows per page changed to', value);
        }
      });
    });
    
    console.log('Rows per page controls initialized');
  }
  
  /**
   * Update UI elements outside of List.js
   */
  function updateUI() {
    if (!listJsInstance) return;
    
    // Update the songlist heading to indicate search state
    const songlistHeading = document.getElementById('songlist-heading');
    if (!songlistHeading) return;
    
    const totalItems = listJsInstance.matchingItems.length;
    const searchValue = document.querySelector('#songlist-listjs-container .search')?.value || '';
    const originalText = "Song List";
    
    if (searchValue && searchValue.trim() !== '') {
      // When showing search results
      songlistHeading.innerHTML = `${originalText} <span class="text-sm ml-2 opacity-80 font-normal">(Showing ${totalItems} results for "${searchValue}")</span>`;
    } else {
      // When showing all items or reset
      songlistHeading.innerHTML = originalText;
      // Restore toggle icon
      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'toggle-icon';
      toggleIcon.setAttribute('aria-hidden', 'true');
      toggleIcon.textContent = songlistHeading.getAttribute('aria-expanded') === 'true' ? '−' : '+';
      songlistHeading.appendChild(toggleIcon);
    }
    
    // Add event listener to List.js updates
    if (listJsInstance && !listJsInstance._boundUpdateEvent) {
      listJsInstance.on('updated', function() {
        updateUI();
      });
      listJsInstance._boundUpdateEvent = true;
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
              <p class="text-sm mt-2">Please make sure you're accessing this site through a web server (http://localhost:8000 or https://localhost:8000) and not directly from a file.</p>
            </div>
          </td>
        </tr>
      `;
    }
  }
  
  // Listen for section expansion
  const songlistHeading = document.getElementById('songlist-heading');
  if (songlistHeading) {
    songlistHeading.addEventListener('click', function() {
      // Check if content is being expanded
      const willBeExpanded = this.getAttribute('aria-expanded') === 'false';
      console.log('Song List section clicked, willBeExpanded:', willBeExpanded);
      
      if (willBeExpanded && listJsInstance) {
        console.log('Song List section will be expanded, updating List.js');
        // Force List.js to recalculate layout when section is expanded
        setTimeout(() => {
          listJsInstance.update();
        }, 50);
      }
    });
  }
  
  // Handle responsive behavior
  window.addEventListener('resize', () => {
    if (listJsInstance) {
      // Give the browser time to reflow then update List.js
      setTimeout(() => {
        listJsInstance.update();
      }, 100);
    }
  });
  
  // Mark initial load as complete after a delay
  setTimeout(() => {
    window.initialLoadComplete = true;
    console.log('Initial page load completed, scroll behavior enabled');
  }, 1500);
}); 