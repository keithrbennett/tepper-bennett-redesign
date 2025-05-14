/**
 * Search handler functionality for Tepper & Bennett
 * Manages search functionality for song data
 */

// DOM element references
const searchInput = document.getElementById('songs-search');
const searchButton = document.getElementById('search-button');

// Reference to original data
let originalSongData = null;

/**
 * Initialize search functionality
 * @param {Array} songData - The full song data array
 */
function initSearch(songData) {
  // Store reference to original data
  originalSongData = songData;
  
  if (searchButton && searchInput) {
    // Add click event listener
    searchButton.addEventListener('click', function() {
      performSearch();
    });
    
    // Add search on Enter key
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
}

/**
 * Perform search on song data
 */
function performSearch() {
  if (!originalSongData) return;
  
  const searchTerm = searchInput.value.toLowerCase();
  console.log('Searching for:', searchTerm);
  
  if (searchTerm) {
    const filteredData = originalSongData.filter(song => 
      song.title.toLowerCase().includes(searchTerm) || 
      song.performers.toLowerCase().includes(searchTerm) || 
      song.administrator.toLowerCase().includes(searchTerm)
    );
    
    // Show "no results" if nothing found
    if (filteredData.length === 0) {
      showNoResults(searchTerm);
    } else {
      // Reset pagination when searching
      window.tablePagination.resetPagination();
      window.tablePagination.updateFilteredData(filteredData);
      window.renderTable(filteredData);
      window.renderMobileList(filteredData);
    }
  } else {
    // Reset pagination when clearing search
    window.tablePagination.resetPagination();
    window.tablePagination.updateFilteredData(originalSongData);
    window.renderTable(originalSongData);
    window.renderMobileList(originalSongData);
  }
}

/**
 * Show no results message in tables
 * @param {string} searchTerm - The search term that yielded no results
 */
function showNoResults(searchTerm) {
  // Show no results in desktop table
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
        resetSearch();
      });
    }
  }
  
  // Show no results in mobile list
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
      resetSearch();
    });
  }
}

/**
 * Reset search to show all songs
 */
function resetSearch() {
  if (!originalSongData) return;
  
  searchInput.value = '';
  window.tablePagination.resetPagination();
  window.tablePagination.updateFilteredData(originalSongData);
  window.renderTable(originalSongData);
  window.renderMobileList(originalSongData);
}

// Export functions to global scope
window.searchHandler = {
  initSearch,
  performSearch,
  resetSearch
}; 