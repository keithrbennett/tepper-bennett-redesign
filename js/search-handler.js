/**
 * Search handler module for Tepper & Bennett song table
 * Manages search functionality for the song listings
 */

// Data storage
let originalSongData = [];

/**
 * Initialize the search functionality
 * @param {Array} songData - The complete song data array
 */
function initSearch(songData) {
  console.log('Initializing search with', songData.length, 'songs');
  
  // Store the original data for reference
  originalSongData = songData;
  
  // Get DOM elements (they might not have been available during initial script load)
  const searchInput = document.getElementById('songs-search');
  const searchButton = document.getElementById('search-button');
  
  // Set up event listeners
  if (searchButton && searchInput) {
    console.log('Search elements found, setting up listeners');
    
    // Search on button click
    searchButton.addEventListener('click', function() {
      performSearch();
    });
    
    // Search on Enter key press
    searchInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        performSearch();
      }
    });
    
    // Real-time search with debounce
    let debounceTimer;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        performSearch();
      }, 300); // Wait 300ms after typing stops
    });
  } else {
    console.warn('Search elements not found in the DOM');
  }
}

/**
 * Perform search based on current input value
 */
function performSearch() {
  // Get fresh DOM reference
  const searchInput = document.getElementById('songs-search');
  if (!searchInput) {
    console.error('Search input element not found');
    return;
  }
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  console.log('Searching for:', searchTerm);
  
  if (searchTerm) {
    try {
      const filteredData = originalSongData.filter(song => {
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
        showNoResults(searchTerm);
      } else {
        // Reset pagination when searching
        if (window.tablePagination) {
          window.tablePagination.resetPagination();
          window.tablePagination.updateFilteredData(filteredData);
        } else {
          console.warn('tablePagination not available');
        }
        
        // Update table views
        if (window.renderTable) {
          window.renderTable(filteredData);
        } else {
          console.warn('renderTable not available');
        }
        
        if (window.renderMobileList) {
          window.renderMobileList(filteredData);
        } else {
          console.warn('renderMobileList not available');
        }
      }
    } catch (error) {
      console.error('Error during search:', error);
      alert('An error occurred while searching. Please try again.');
    }
  } else {
    // Reset pagination when clearing search
    if (window.tablePagination) {
      window.tablePagination.resetPagination();
      window.tablePagination.updateFilteredData(originalSongData);
    } else {
      console.warn('tablePagination not available');
    }
    
    // Update table views
    if (window.renderTable) {
      window.renderTable(originalSongData);
    } else {
      console.warn('renderTable not available');
    }
    
    if (window.renderMobileList) {
      window.renderMobileList(originalSongData);
    } else {
      console.warn('renderMobileList not available');
    }
  }
}

/**
 * Update the songs heading to indicate search is active
 * @param {string} searchTerm - The current search term
 * @param {number} resultCount - Number of results found
 */
function updateSearchIndicator(searchTerm, resultCount) {
  const songsHeading = document.getElementById('songs-heading');
  if (!songsHeading) return;
  
  const originalText = "Songs";
  
  if (searchTerm && resultCount > 0) {
    songsHeading.innerHTML = `${originalText} <span style="font-size: 0.7em; opacity: 0.8; font-weight: normal;">(Filtered: ${resultCount} results)</span>`;
  } else {
    songsHeading.textContent = originalText;
    // Restore toggle icon
    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'toggle-icon';
    toggleIcon.setAttribute('aria-hidden', 'true');
    toggleIcon.textContent = songsHeading.getAttribute('aria-expanded') === 'true' ? '−' : '+';
    songsHeading.appendChild(toggleIcon);
  }
}

/**
 * Show no results message in tables
 * @param {string} searchTerm - The search term that yielded no results
 */
function showNoResults(searchTerm) {
  // Get fresh DOM references
  const searchInput = document.getElementById('songs-search');
  
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
      
      // Add event listener after creating the button
      setTimeout(() => {
        const resetButton = document.getElementById('reset-search');
        if (resetButton) {
          resetButton.addEventListener('click', function() {
            resetSearch();
          });
        }
      }, 0);
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
    
    // Add event listener after creating the button
    setTimeout(() => {
      const mobileResetButton = document.getElementById('mobile-reset-search');
      if (mobileResetButton) {
        mobileResetButton.addEventListener('click', function() {
          resetSearch();
        });
      }
    }, 0);
  }
}

/**
 * Reset search to show all songs
 */
function resetSearch() {
  if (!originalSongData) return;
  
  // Get fresh DOM reference
  const searchInput = document.getElementById('songs-search');
  if (searchInput) {
    searchInput.value = '';
  }
  
  if (window.tablePagination) {
    window.tablePagination.resetPagination();
    window.tablePagination.updateFilteredData(originalSongData);
  } else {
    console.warn('tablePagination not available');
  }
  
  if (window.renderTable) {
    window.renderTable(originalSongData);
  } else {
    console.warn('renderTable not available');
  }
  
  if (window.renderMobileList) {
    window.renderMobileList(originalSongData);
  } else {
    console.warn('renderMobileList not available');
  }
}

// Export functions to global scope
window.searchHandler = {
  initSearch,
  performSearch,
  resetSearch
}; 