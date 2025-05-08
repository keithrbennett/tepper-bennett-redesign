document.addEventListener('DOMContentLoaded', function() {
    // Get references to elements
    const table = document.getElementById('songs-table');
    const searchInput = document.getElementById('songs-search');
    const searchButton = document.getElementById('search-button');
    const sortableHeaders = document.querySelectorAll('#songs-table th.sortable');
    const tableRows = Array.from(table.querySelectorAll('tbody tr'));
    
    // Initial sort state
    let currentSort = {
        column: 'title',
        direction: 'asc' // 'asc' or 'desc'
    };
    
    // Function to sort the table
    function sortTable(column) {
        // Update sort direction
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
        
        // Update sort icons
        sortableHeaders.forEach(header => {
            const icon = header.querySelector('.sort-icon');
            if (header.dataset.sort === column) {
                icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
                // Add Bootstrap sorted header class
                header.classList.add('bg-primary');
                header.classList.add('text-white');
            } else {
                icon.textContent = '';
                // Remove Bootstrap sorted header class
                header.classList.remove('bg-primary');
                header.classList.remove('text-white');
            }
        });
        
        // Sort the rows
        const sortedRows = tableRows.slice().sort((a, b) => {
            let aValue, bValue;
            
            // Get column index
            const index = Array.from(sortableHeaders).findIndex(header => header.dataset.sort === column);
            
            // Get cell values
            aValue = a.querySelectorAll('td')[index].textContent.trim().toLowerCase();
            bValue = b.querySelectorAll('td')[index].textContent.trim().toLowerCase();
            
            // Compare values
            if (aValue < bValue) {
                return currentSort.direction === 'asc' ? -1 : 1;
            } else if (aValue > bValue) {
                return currentSort.direction === 'asc' ? 1 : -1;
            } else {
                return 0;
            }
        });
        
        // Update table with sorted rows
        const tbody = table.querySelector('tbody');
        sortedRows.forEach(row => {
            tbody.appendChild(row);
        });
    }
    
    // Function to filter the table
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        tableRows.forEach(row => {
            const title = row.querySelectorAll('td')[0].textContent.toLowerCase();
            const performer = row.querySelectorAll('td')[1].textContent.toLowerCase();
            const admin = row.querySelectorAll('td')[2].textContent.toLowerCase();
            
            // Show/hide row based on search term
            if (searchTerm === '' || 
                title.includes(searchTerm) || 
                performer.includes(searchTerm) || 
                admin.includes(searchTerm)) {
                row.style.display = '';
                // Bootstrap transition animation
                row.classList.remove('fade');
            } else {
                row.style.display = 'none';
                // Bootstrap transition animation
                row.classList.add('fade');
            }
        });
        
        // Show search results message
        const visibleRows = tableRows.filter(row => row.style.display !== 'none').length;
        updateSearchResults(visibleRows, tableRows.length);
    }
    
    // Function to update search results message
    function updateSearchResults(visible, total) {
        // Find the container or create one if it doesn't exist
        let resultsContainer = document.getElementById('search-results-info');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-results-info';
            resultsContainer.className = 'text-muted small text-center mb-3';
            const tableContainer = document.querySelector('.table-responsive');
            tableContainer.parentNode.insertBefore(resultsContainer, tableContainer);
        }
        
        if (visible === total || searchInput.value.trim() === '') {
            resultsContainer.textContent = '';
        } else {
            resultsContainer.textContent = `Showing ${visible} of ${total} songs`;
        }
    }
    
    // Add event listeners
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            sortTable(header.dataset.sort);
        });
    });
    
    searchButton.addEventListener('click', filterTable);
    
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterTable();
        }
    });
    
    // Initial sort
    sortTable('title');
}); 