/**
 * Global configuration settings for Tepper & Bennett website
 */

// Create a global configuration object
window.tbConfig = {
  // Debug settings
  debug: {
    enabled: true,           // Set to false in production
    logSectionEvents: true,  // Log section toggle events
    logElvisEvents: true,    // Special debug for Elvis section
    logScrollEvents: false   // Log scroll events
  },

  // YAML data config
  data: {
    dataDir: './data/',
    files: {
      songPlays: 'song-plays.yml',
      elvisSongs: 'elvis-songs.yml',
      nonElvisSongs: 'non-elvis-songs.yml',
      performers: 'performers.yml',
      organizations: 'organizations.yml',
      rightsAdminSongs: 'rights-admin-songs.yml'
    }
  },

  // Pagination settings
  pagination: {
    desktop: {
      defaultRowsPerPage: 15,
      rowsPerPageOptions: [10, 15, 20, 25, 40, 100]
    },
    mobile: {
      defaultRowsPerPage: 10,
      itemsPerPage: 5
    }
  },

  // Search config
  search: {
    minChars: 2,
    debounceMs: 300
  }
};

// Log configuration loaded
console.log('Configuration loaded:', window.tbConfig);

// Verify js-yaml loading when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (!window.jsyaml) {
    console.error('CRITICAL ERROR: js-yaml is not loaded correctly!');
    // Display error in song tables
    const songsTable = document.getElementById('songs-table');
    if (songsTable && songsTable.querySelector('tbody')) {
      songsTable.querySelector('tbody').innerHTML = `
        <tr>
          <td colspan="4" class="py-4 text-center text-red-600">
            <div>
              <p class="font-bold">Error loading YAML library</p>
              <p class="text-sm">Please check console for details</p>
            </div>
          </td>
        </tr>
      `;
    }
  } else {
    console.log('js-yaml loaded successfully, version:', window.jsyaml.version);
  }
}); 