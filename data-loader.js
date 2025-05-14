/**
 * Data loader for Tepper & Bennett song information
 * Loads and processes song data from YAML files
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Data loader: starting');
  
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
  
  // Show loading indicator
  const songsTable = document.getElementById('songs-table');
  const tbody = songsTable?.querySelector('tbody');
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
    window.showTableError?.('Your browser does not support modern web features required by this application. Please use a current version of Chrome, Firefox, Safari, or Edge.');
    return;
  }
  
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
        window.showTableError?.(`Failed to load data: ${error.message}. Please check that you're accessing this site through a web server.`);
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
    
    // Create song organization map
    const songOrgMap = createSongOrgMap(rightsAdminSongs);
    
    // Combine song data
    const allSongs = [...elvisSongs, ...nonElvisSongs];
    const songsMap = {};
    allSongs.forEach(song => {
      songsMap[song.code] = song;
    });
    
    // Process song data
    const songData = processTableData(songPlays, songsMap, performersMap, orgsMap, songOrgMap);
    
    console.log(`Song data processed: ${songData.length} songs`);
    
    // Initialize modules with the processed data
    if (window.tablePagination) {
      window.tablePagination.initPagination(songData);
    }
    
    if (window.searchHandler) {
      window.searchHandler.initSearch(songData);
    }
    
    // Render the table and mobile list
    if (window.renderTable) {
      window.renderTable(songData);
    }
    
    if (window.renderMobileList) {
      window.renderMobileList(songData);
    }
  }
  
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
  
  // Listen for section expansion
  const songsHeading = document.getElementById('songs-heading');
  if (songsHeading) {
    songsHeading.addEventListener('click', function() {
      // Check if content is being expanded
      const willBeExpanded = this.getAttribute('aria-expanded') === 'false';
      console.log('Songs section clicked, willBeExpanded:', willBeExpanded);
    });
  }
}); 