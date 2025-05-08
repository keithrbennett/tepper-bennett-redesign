document.addEventListener('DOMContentLoaded', () => {
    // View switching
    const viewButtons = document.querySelectorAll('.view-button');
    const views = document.querySelectorAll('.view-content');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            
            // Update button states
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update view visibility
            views.forEach(v => {
                v.classList.remove('active');
                if (v.classList.contains(`${view}-view`)) {
                    v.classList.add('active');
                }
            });
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    const filterSelects = document.querySelectorAll('.filter-select');

    function filterSongs() {
        const searchTerm = searchInput.value.toLowerCase();
        const genreFilter = filterSelects[0].value;
        const artistFilter = filterSelects[1].value;
        const yearFilter = filterSelects[2].value;

        // Filter gallery view
        const songCards = document.querySelectorAll('.song-card');
        songCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const artist = card.querySelector('.artist').textContent.toLowerCase();
            const genre = card.querySelector('.genre').textContent.toLowerCase();
            const year = card.querySelector('.year').textContent;

            const matchesSearch = title.includes(searchTerm) || artist.includes(searchTerm);
            const matchesGenre = !genreFilter || genre === genreFilter.toLowerCase();
            const matchesArtist = !artistFilter || artist === artistFilter.toLowerCase();
            const matchesYear = !yearFilter || year === yearFilter;

            card.style.display = matchesSearch && matchesGenre && matchesArtist && matchesYear ? 'block' : 'none';
        });

        // Filter list view
        const tableRows = document.querySelectorAll('.songs-table tbody tr');
        tableRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const title = cells[0].textContent.toLowerCase();
            const artist = cells[1].textContent.toLowerCase();
            const genre = cells[2].textContent.toLowerCase();
            const year = cells[3].textContent;

            const matchesSearch = title.includes(searchTerm) || artist.includes(searchTerm);
            const matchesGenre = !genreFilter || genre === genreFilter.toLowerCase();
            const matchesArtist = !artistFilter || artist === artistFilter.toLowerCase();
            const matchesYear = !yearFilter || year === yearFilter;

            row.style.display = matchesSearch && matchesGenre && matchesArtist && matchesYear ? 'table-row' : 'none';
        });
    }

    // Add event listeners for filtering
    searchInput.addEventListener('input', filterSongs);
    filterSelects.forEach(select => {
        select.addEventListener('change', filterSongs);
    });

    // Play button functionality
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const card = button.closest('.song-card');
            const title = card.querySelector('h3').textContent;
            // Here you would typically open the YouTube video
            console.log(`Playing: ${title}`);
        });
    });

    // Table sorting
    const tableHeaders = document.querySelectorAll('.songs-table th');
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const index = Array.from(header.parentElement.children).indexOf(header);
            const rows = Array.from(document.querySelectorAll('.songs-table tbody tr'));
            const isAscending = header.classList.contains('asc');
            
            // Update sort direction
            tableHeaders.forEach(h => h.classList.remove('asc', 'desc'));
            header.classList.add(isAscending ? 'desc' : 'asc');
            
            // Sort rows
            rows.sort((a, b) => {
                const aValue = a.children[index].textContent;
                const bValue = b.children[index].textContent;
                return isAscending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
            });
            
            // Reorder rows in the table
            const tbody = document.querySelector('.songs-table tbody');
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}); 