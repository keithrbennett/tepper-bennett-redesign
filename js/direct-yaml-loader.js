/**
 * Direct YAML loader for Tepper & Bennett
 * Bypasses the issues in the existing loader using a simplified approach
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Direct YAML loader: starting');
  
  // Reference to the table
  const songsTable = document.getElementById('songs-table');
  if (!songsTable) {
    console.error('Songs table not found');
    return;
  }
  
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
    'organizations.yml'
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
      .then(([songPlays, elvisSongs, nonElvisSongs, performers, organizations]) => {
        if (!songPlays || !songPlays.length) {
          throw new Error('Song plays data is empty or invalid');
        }
        
        console.log('All files loaded successfully:');
        console.log('- song-plays.yml:', songPlays.length, 'entries');
        console.log('- elvis-songs.yml:', elvisSongs.length, 'entries');
        console.log('- non-elvis-songs.yml:', nonElvisSongs.length, 'entries');
        console.log('- performers.yml:', performers.length, 'entries');
        console.log('- organizations.yml:', organizations.length, 'entries');
        
        processSongData(songPlays, elvisSongs, nonElvisSongs, performers, organizations);
        return true;
      });
  }
  
  /**
   * Process the loaded data and render the table
   */
  function processSongData(songPlays, elvisSongs, nonElvisSongs, performers, organizations) {
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
    
    // Combine song data
    const allSongs = [...elvisSongs, ...nonElvisSongs];
    const songsMap = {};
    allSongs.forEach(song => {
      songsMap[song.code] = song;
    });
    
    // Build data for the table
    const songData = songPlays.map(play => {
      const song = songsMap[play.song_code];
      const performer = performersMap[play.performer_codes] || play.performer_codes;
      
      return {
        title: song ? song.name : play.song_code,
        performers: performer,
        administrator: song && song.organization ? orgsMap[song.organization] : 'Unknown',
        youtubeUrl: play.youtube_key ? `https://www.youtube.com/watch?v=${play.youtube_key}` : '#'
      };
    });
    
    console.log(`Song data processed: ${songData.length} songs`);
    
    // Render the table
    renderTable(songData);
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
          console.log(`File ${url} loaded successfully:`, data.length, 'items');
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
    
    // Add song count summary
    const countRow = document.createElement('tr');
    countRow.innerHTML = `
      <td colspan="4" class="py-2 px-4 text-sm text-gray-600 bg-gray-50">
        Displaying ${songs.length} song${songs.length !== 1 ? 's' : ''}
      </td>
    `;
    tbody.appendChild(countRow);
    
    // Add each song to the table
    songs.forEach(song => {
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
}); 