/**
 * Data loader for Tepper & Bennett song information
 * Loads and processes song data from YAML files for display in the songs table
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Data loader: starting');

  // Flag to track initial page load
  window.initialLoadComplete = false;

  // Reference to the tables
  const songlistTable = document.getElementById('songlist-table');
  const elvisTable = document.getElementById('elvis-table');
  if (!songlistTable) {
    console.error('Songs table not found');
    return;
  }

  // Store data references
  let loadedSongData = null;
  window.loadedSongData = null;
  let listJsInstance = null;
  let elvisListJsInstance = null;

  // Show loading indicator for main song list
  const tbody = songlistTable?.querySelector('tbody');
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

  // Show loading indicator for Elvis table if it exists
  const elvisTbody = elvisTable?.querySelector('tbody');
  if (elvisTbody) {
    elvisTbody.innerHTML = `
      <tr>
        <td colspan="3" class="py-8 text-center">
          <div class="inline-block animate-pulse">
            <span class="inline-block">Loading Elvis song data...</span>
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

  // Use configuration from window.tbConfig
  const dataPath = window.tbConfig?.data?.dataDir || 'data/';
  const configuredFiles = window.tbConfig?.data?.files || {};
  
  // Ensure critical files are defined, provide defaults if not
  const fileNames = [
    configuredFiles.songPlays || 'song-plays.yml',
    configuredFiles.elvisSongs || 'elvis-songs.yml',
    configuredFiles.nonElvisSongs || 'non-elvis-songs.yml',
    configuredFiles.performers || 'performers.yml',
    configuredFiles.organizations || 'organizations.yml',
    configuredFiles.rightsAdminSongs || 'rights-admin-songs.yml'
  ];

  console.log('Using data path from config:', dataPath);
  console.log('Using file names from config:', fileNames);
  console.log('Current location:', window.location.href);

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

    // Filter for Elvis songs only
    const elvisSongData = songlistData.filter(song => {
      // Check if the performer is Elvis or includes Elvis (for duets)
      return song.performers === 'Elvis Presley' ||
             song.performers.toLowerCase().includes('elvis') ||
             (Array.isArray(song.performers) &&
              song.performers.some(performer =>
                performer === 'Elvis Presley' ||
                performer.toLowerCase().includes('elvis')
              ));
    });

    console.log(`Elvis song data filtered: ${elvisSongData.length} songs`);

    // Store the processed data for reuse
    loadedSongData = songlistData;
    window.loadedSongData = songlistData;

    // Initialize List.js for both tables
    initializeListJs(songlistData);
    initializeElvisListJs(elvisSongData);
  }

  /**
   * Initializes a List.js table with song data based on provided configuration.
   * @param {Object} config - Configuration object for the table.
   * @param {string} config.containerId - The ID of the container element.
   * @param {string} config.searchPlaceholder - The placeholder text for the search input.
   * @param {string} config.tableId - The ID for the table element.
   * @param {Array<Object>} config.tableHeaders - Array of header objects { text: string, sort: string | null }.
   * @param {Array<string>} config.valueNames - Array of value names for List.js.
   * @param {string} config.itemTemplate - The HTML template string for a List.js item row.
   * @param {Array} config.songData - Processed song data for the table.
   * @param {boolean} [config.callUpdateUI=false] - Whether to call the updateUI function after initialization.
   * @param {string} [config.headingId] - The ID of the section heading for expansion listener.
   * @param {string} [config.originalHeadingText] - The original text of the section heading.
   */
  function initializeSongTable(config) {
    console.log(`Initializing List.js table for container: ${config.containerId} with ${config.songData.length} songs`);

    // Wait for DOM to be fully ready
    setTimeout(() => {
      try {
        // Get the container element
        const container = document.getElementById(config.containerId);
        if (!container) {
          console.error(`Container element not found: ${config.containerId}`);
          if (config.containerId === 'songlist-listjs-container') {
             showError('Table container element not found');
          }
          return;
        }

        // Check if List.js library is available
        if (typeof window.List !== 'function') {
          console.error('List.js library not loaded');
           if (config.containerId === 'songlist-listjs-container') {
             showError('Required library List.js is not loaded. Please check your internet connection and reload the page.');
           }
          return;
        }

        // Build table headers HTML
        const theadHtml = config.tableHeaders.map(header => {
          const sortAttr = header.sort ? `data-sort="${header.sort}"` : '';
          const textAlignClass = header.sort ? 'text-left' : 'text-center'; // Default non-sortable to center
          return `<th class="py-3 px-4 ${textAlignClass} ${header.sort ? 'sort' : ''}" ${sortAttr}>${header.text}</th>`;
        }).join('');

        // Completely recreate the table structure for List.js
        container.innerHTML = `
          <div class="list-controls mb-4">
            <input class="search form-control w-full p-3 border border-gray-300 rounded-md"
              placeholder="${config.searchPlaceholder}"
              aria-label="${config.searchPlaceholder}">
          </div>

          <table id="${config.tableId}" class="min-w-full bg-white">
            <thead class="bg-navy text-white">
              <tr>
                ${theadHtml}
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
        const listData = config.songData.map(song => {
            const item = {};
            config.valueNames.forEach(key => {
                if (key === 'youtube') {
                     item[key] = `<a href="${song.youtubeUrl || '#'}" class="text-red-600 hover:text-red-800" target="_blank">▶</a>`;
                } else {
                     item[key] = song[key] || ''; // Use empty string for missing data
                }
            });
            return item;
        });

        // Options for List.js
        const options = {
          valueNames: config.valueNames,
          item: config.itemTemplate,
          page: window.tbConfig?.pagination?.desktop?.defaultRowsPerPage || 15,
          pagination: {
            name: "pagination",
            paginationClass: "pagination",
            outerWindow: 2,
            innerWindow: 4,
            left: 3,
            right: 3
          }
        };

        // Initialize List.js
        const list = new List(container, options, listData);

        // Store reference for later use
        if (config.containerId === 'songlist-listjs-container') {
            listJsInstance = list;
        } else if (config.containerId === 'elvis-listjs-container') {
            elvisListJsInstance = list;
        }


        // Setup rows per page control
        setupRowsPerPage(list, container);

        // Fix pagination to prevent scrolling to top
        preventPaginationScroll(container);

        // Initial UI update (only for main song list)
        if (config.callUpdateUI && config.headingId && config.containerId && config.originalHeadingText) {
           updateUI(list, config.headingId, config.containerId, config.originalHeadingText);
        }

        // Add event listener for List.js updates
        list.on('updated', function() {
          console.log(`List.js for ${config.containerId} updated`);
          if (config.callUpdateUI && config.headingId && config.containerId && config.originalHeadingText) {
             updateUI(list, config.headingId, config.containerId, config.originalHeadingText);
          }
          // Re-apply pagination fix after list update
          preventPaginationScroll(container);
        });

        console.log(`List.js initialized successfully for ${config.containerId} with`, list.size(), 'items');

        // Listen for section expansion
        if (config.headingId) {
            const heading = document.getElementById(config.headingId);
            if (heading) {
              heading.addEventListener('click', function() {
                const willBeExpanded = this.getAttribute('aria-expanded') === 'false';

                if (willBeExpanded) {
                  // Force List.js to recalculate layout when section is expanded
                  setTimeout(() => {
                    list.update(); // Use the local list instance
                  }, 50);
                  
                  // Add scrolling after section expansion
                  ScrollUtils.scrollAfterExpansion(this);
                }
              });
            }
        }

      } catch (error) {
        console.error(`Error initializing List.js for ${config.containerId}:`, error);
         if (config.containerId === 'songlist-listjs-container') {
            showError(`Failed to initialize table: ${error.message}`);
         }
      }
    }, 100); // Small delay to ensure DOM is ready
  }

  /**
   * Initialize List.js with song data
   * @param {Array} songData - Processed song data
   */
  function initializeListJs(songData) {
    const config = {
      containerId: 'songlist-listjs-container',
      searchPlaceholder: 'Search songs, performers, and administrators, e.g.: elvis',
      tableId: 'songlist-table',
      tableHeaders: [
        { text: '▶', sort: null },
        { text: 'Title', sort: 'title' },
        { text: 'Performer(s)', sort: 'performers' },
        { text: 'Rights Administrator', sort: 'administrator' }
      ],
      valueNames: ['youtube', 'title', 'performers', 'administrator'],
      itemTemplate: `<tr>
                      <td class="youtube py-3 px-4 text-center"></td>
                      <td class="title py-3 px-4"></td>
                      <td class="performers py-3 px-4"></td>
                      <td class="administrator py-3 px-4"></td>
                    </tr>`,
      songData: songData,
      callUpdateUI: true,
      headingId: 'songlist-heading',
      originalHeadingText: 'Song List'
    };
    initializeSongTable(config);
  }

  /**
   * Prevent pagination links from scrolling to top of page for a specific table container.
   * @param {HTMLElement} container - The container element for the table.
   */
  function preventPaginationScroll(container) {
    setTimeout(() => {
      const paginationLinks = container.querySelectorAll('.pagination li a');
      paginationLinks.forEach(link => {
        if (!link._hasClickHandler) {
          link._hasClickHandler = true;
          link.addEventListener('click', function(e) {
            e.preventDefault();
          });
        }
      });
    }, 100);
  }

  /**
   * Setup rows per page dropdown to work with a specific List.js instance.
   * @param {List} listInstance - The List.js instance to control.
   * @param {HTMLElement} container - The container element for the table.
   */
  function setupRowsPerPage(listInstance, container) {
    const rowsPerPageSelect = container.querySelector('.rows-per-page-select');

    if (!rowsPerPageSelect) {
      console.warn(`No rows-per-page-select element found in container: ${container.id}`);
      return;
    }

    // Get options from config
    const options = window.tbConfig?.pagination?.desktop?.rowsPerPageOptions || [10, 15, 20, 50, 100];
    const defaultValue = window.tbConfig?.pagination?.desktop?.defaultRowsPerPage || 15;

    // Populate the select with options
    // Clear existing options
    rowsPerPageSelect.innerHTML = '';

    // Add options from config
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      optionElement.selected = option === defaultValue;
      rowsPerPageSelect.appendChild(optionElement);
    });

    // Add change event listener
    rowsPerPageSelect.addEventListener('change', function() {
      const value = parseInt(this.value, 10);
      if (listInstance && !isNaN(value)) {
        listInstance.page = value;
        listInstance.update();
        console.log(`Rows per page changed to ${value} for table in ${container.id}`);
      }
    });

    console.log(`Rows per page control initialized for table in ${container.id}`);
  }

  /**
   * Update UI elements outside of List.js for a specific table.
   * @param {List} listInstance - The List.js instance.
   * @param {string} headingId - The ID of the section heading.
   * @param {string} containerId - The ID of the table container.
   * @param {string} originalHeadingText - The original text of the heading.
   */
  function updateUI(listInstance, headingId, containerId, originalHeadingText) {
    if (!listInstance) return;

    // Update the heading to indicate search state
    const heading = document.getElementById(headingId);
    if (!heading) return;

    const totalItems = listInstance.matchingItems.length;
    const searchValue = document.querySelector(`#${containerId} .search`)?.value || '';
    const originalText = originalHeadingText;

    if (searchValue && searchValue.trim() !== '') {
      // When showing search results
      heading.innerHTML = `${originalText} <span class="text-sm ml-2 opacity-80 font-normal">(Showing ${totalItems} results for "${searchValue}")</span>`;
    } else {
      // When showing all items or reset
      heading.innerHTML = originalText;
      // Restore toggle icon
      const toggleIcon = document.createElement('span');
      toggleIcon.className = 'toggle-icon';
      toggleIcon.setAttribute('aria-hidden', 'true');
      toggleIcon.textContent = heading.getAttribute('aria-expanded') === 'true' ? '−' : '+';
      heading.appendChild(toggleIcon);
    }

    // Add event listener to List.js updates if not already bound
    // This part might need careful handling to avoid multiple bindings
    // For now, we'll rely on the check within initializeSongTable
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

      if (willBeExpanded && listJsInstance) {
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
  }, 1500);

  /**
   * Initialize List.js for the Elvis songs table
   * @param {Array} elvisSongData - Filtered Elvis song data
   */
  function initializeElvisListJs(elvisSongData) {
    const config = {
      containerId: 'elvis-listjs-container',
      searchPlaceholder: 'Search Elvis songs',
      tableId: 'elvis-table',
      tableHeaders: [
        { text: '▶', sort: null },
        { text: 'Title', sort: 'title' },
        { text: 'Rights Administrator', sort: 'administrator' }
      ],
      valueNames: ['youtube', 'title', 'administrator'],
      itemTemplate: `<tr>
                      <td class="youtube py-3 px-4 text-center"></td>
                      <td class="title py-3 px-4"></td>
                      <td class="administrator py-3 px-4"></td>
                    </tr>`,
      songData: elvisSongData,
      callUpdateUI: false, // Don't call updateUI for Elvis table
      headingId: 'elvis-heading',
      originalHeadingText: 'Elvis Presley Songs'
    };
    initializeSongTable(config);
  }
});
