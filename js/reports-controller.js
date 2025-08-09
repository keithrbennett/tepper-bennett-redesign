/**
 * Reports Controller for Tepper & Bennett website
 * JavaScript-based reporting system adapted from Rails architecture
 */


class ReportsController {
  constructor() {
    this.reportsMetadata = this.initializeReportsMetadata();
    this.currentReport = null;
    this.currentFormat = 'html';
  }

  initializeReportsMetadata() {
    const metadata = {
      'all': {
        title: 'All Data',
        report: new AllDataReport()
      },
      'songs': {
        title: 'Songs',
        report: new SongsReport()
      },
      'performers': {
        title: 'Performers',
        report: new CodeNameReport('performers', 'performers.yml')
      },
      'genres': {
        title: 'Genres',
        report: new CodeNameReport('genres', 'genres.yml')
      },
      'movies': {
        title: 'Movies',
        report: new CodeNameReport('movies', 'movies.yml')
      },
      'organizations': {
        title: 'Organizations',
        report: new CodeNameReport('organizations', 'organizations.yml')
      },
      'writers': {
        title: 'Writers',
        report: new CodeNameReport('writers', 'writers.yml')
      },
      'song-plays': {
        title: 'Song Plays',
        report: new SongPlaysReport()
      },
      'song-performers': {
        title: 'Song Performers',
        report: new SongPerformersReport()
      },
      'song-genres': {
        title: 'Song Genres',
        report: new SongGenresReport()
      }
    };
    return metadata;
  }

  async showReportsIndex() {
    // Populate the inline reports list
    this.populateReportsList();
  }

  populateReportsList() {
    const reportsList = document.getElementById('reports-list');
    
    if (!reportsList) {
      return;
    }

    // Create simple text links for each report
    const listHTML = `
      <ul class="space-y-4">
        ${Object.entries(this.reportsMetadata).map(([key, metadata]) => `
          <li>
            <a 
              href="javascript:void(0)" 
              onclick="reportsController.showReportInline('${key}')"
              class="text-xl font-bold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 transition-all duration-200 px-3 py-2 rounded-md block"
            >
              ${metadata.title}
            </a>
          </li>
        `).join('')}
      </ul>
    `;

    reportsList.innerHTML = listHTML;
  }

  closeReportsModal() {
    const modal = document.getElementById('reports-modal');
    if (modal) {
      modal.remove();
    }
    
    // Restore body styling and scroll position
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    
    // Restore scroll position
    if (typeof window._reportsScrollPosition === 'number') {
      window.scrollTo(0, window._reportsScrollPosition);
      window._reportsScrollPosition = null;
    }
  }

  async showReportInline(reportType) {
    const metadata = this.reportsMetadata[reportType];
    if (!metadata) return;

    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;

    // Show loading state
    reportContent.innerHTML = '<p class="text-gray-600">Loading report...</p>';

    try {
      // Populate the report with data
      await metadata.report.populate();
      this.currentReport = metadata.report;
      this.currentFormat = 'html';
      
      const reportHTML = `
        <div class="mt-6 p-6 bg-gray-50 rounded-lg">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold text-gray-900">Report: ${metadata.title}</h3>
            <div>
              <span class="mr-2 font-medium">Format:</span>
              ${['html', 'text', 'json', 'yaml'].map(format => `
                <button 
                  onclick="reportsController.changeFormatInline('${format}')"
                  class="mr-2 px-3 py-1 text-sm font-medium border rounded-md cursor-pointer"
                  style="${this.currentFormat === format ? 
                    'background-color: #2563eb; color: white; border-color: #2563eb;' : 
                    'background-color: white; color: #374151; border-color: #d1d5db;'}"
                  onmouseover="${this.currentFormat === format ? '' : `this.style.backgroundColor='#f9fafb'; this.style.borderColor='#9ca3af';`}"
                  onmouseout="${this.currentFormat === format ? '' : `this.style.backgroundColor='white'; this.style.borderColor='#d1d5db';`}"
                >
                  ${format.toUpperCase()}
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="border border-gray-200 rounded-md p-4 bg-white">
            <div id="report-content-html">
              ${this.currentReport.content(this.currentFormat)}
            </div>
          </div>
        </div>
      `;

      reportContent.innerHTML = reportHTML;

    } catch (error) {
      console.error('Error loading report:', error);
      reportContent.innerHTML = `
        <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Report</h3>
          <p class="text-red-700">There was an error loading the report. Please try again later.</p>
        </div>
      `;
    }
  }

  changeFormatInline(format) {
    this.currentFormat = format;
    
    // Update button states
    document.querySelectorAll('button[onclick*="changeFormatInline"]').forEach(button => {
      const onclick = button.getAttribute('onclick');
      if (onclick) {
        const match = onclick.match(/changeFormatInline\('([^']+)'\)/);
        if (match) {
          const buttonFormat = match[1];
          if (buttonFormat === format) {
            // Active button - blue background, white text
            button.style.backgroundColor = '#2563eb';
            button.style.color = 'white';
            button.style.borderColor = '#2563eb';
            button.onmouseover = '';
            button.onmouseout = '';
          } else {
            // Inactive button - white background, gray text
            button.style.backgroundColor = 'white';
            button.style.color = '#374151';
            button.style.borderColor = '#d1d5db';
            button.onmouseover = 'this.style.backgroundColor=\"#f9fafb\"; this.style.borderColor=\"#9ca3af\";';
            button.onmouseout = 'this.style.backgroundColor=\"white\"; this.style.borderColor=\"#d1d5db\";';
          }
        }
      }
    });

    // Update content
    const contentDiv = document.getElementById('report-content-html');
    if (contentDiv && this.currentReport) {
      contentDiv.innerHTML = this.currentReport.content(format);
    }
  }

  ensureReportsSectionExpanded() {
    const reportsHeading = document.getElementById('reports-heading');
    const reportsContent = document.getElementById('reports-content');
    
    if (reportsHeading && reportsContent) {
      const isExpanded = reportsHeading.getAttribute('aria-expanded') === 'true';
      if (!isExpanded) {
        // Temporarily disable scrollAfterExpansion
        const originalScrollAfterExpansion = ScrollUtils?.scrollAfterExpansion;
        if (ScrollUtils && ScrollUtils.scrollAfterExpansion) {
          ScrollUtils.scrollAfterExpansion = function() {
            // Do nothing - disable scrolling during report expansion
            return;
          };
        }
        
        // Manually expand the section without triggering scroll
        reportsHeading.setAttribute('aria-expanded', 'true');
        const toggleIcon = reportsHeading.querySelector('.toggle-icon');
        if (toggleIcon) {
          toggleIcon.textContent = '−';
        }
        reportsContent.classList.add('open');
        reportsContent.style.visibility = 'visible';
        reportsContent.style.maxHeight = 'none';
        reportsContent.style.opacity = '1';
        reportsContent.style.display = 'block';
        
        // Restore the original scrollAfterExpansion function
        if (originalScrollAfterExpansion) {
          setTimeout(() => {
            ScrollUtils.scrollAfterExpansion = originalScrollAfterExpansion;
          }, 100);
        }
      }
    }
  }

  handleReportClick(event, reportType) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      // Prevent any default link behavior
      if (event.target.tagName === 'A') {
        event.target.blur();
      }
    }
    
    // Prevent any URL changes that might trigger scrolling
    const currentUrl = window.location.href;
    
    // Small delay to ensure all event handling is complete
    setTimeout(() => {
      this.showReport(reportType);
    }, 5);
  }

  async showReport(reportType) {
    // Use the modal approach instead of in-page display
    return this.showReportInModal(reportType);
  }

  changeFormat(format) {
    this.currentFormat = format;
    
    // Update button states
    document.querySelectorAll('[data-format]').forEach(button => {
      if (button.dataset.format === format) {
        button.className = 'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-blue-600 text-white';
      } else {
        button.className = 'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
      }
    });

    // Update content
    const contentDiv = document.getElementById('report-content');
    if (contentDiv && this.currentReport) {
      contentDiv.innerHTML = this.currentReport.content(format);
    }
    
    // Prevent any event bubbling
    event.preventDefault();
    event.stopPropagation();
  }

  async copyToClipboard() {
    if (!this.currentReport) return;

    try {
      const content = this.currentReport.content(this.currentFormat === 'html' ? 'text' : this.currentFormat);
      
      // If it's HTML, get just the text content
      let textToCopy = content;
      if (this.currentFormat === 'html') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        textToCopy = tempDiv.textContent || tempDiv.innerText || '';
      }

      await navigator.clipboard.writeText(textToCopy);
      
      // Show success notification
      const button = event.target.closest('button');
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Copied!
      `;
      button.classList.add('bg-green-700');
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('bg-green-700');
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }
}

// Initialize the reports controller
const reportsController = new ReportsController();

// Auto-populate reports list when DOM is loaded and when reports section expands
document.addEventListener('DOMContentLoaded', function() {
  // Try to populate reports list immediately
  setTimeout(() => {
    reportsController.populateReportsList();
  }, 100);
  
  // Also listen for when the reports section gets expanded
  const reportsHeading = document.getElementById('reports-heading');
  if (reportsHeading) {
    reportsHeading.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        setTimeout(() => {
          reportsController.populateReportsList();
        }, 50);
      }
    });
  }
});

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);


// Add global event prevention for report-related clicks
document.addEventListener('click', function(event) {
  // If clicking on the "Open Reports" button, prevent default and handle manually
  if (event.target.id === 'show-reports-index' || event.target.closest('#show-reports-index')) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    // Call the inline populate function
    reportsController.populateReportsList();
    
    return false;
  }
}, true); // Use capture phase

// Prevent any default link behavior that might cause scrolling
document.addEventListener('click', function(event) {
  if (event.target.closest('a')) {
    const link = event.target.closest('a');
    const href = link.getAttribute('href');
    
    // If it's a javascript:void(0) link or has onclick that mentions reports, prevent default
    if (href === 'javascript:void(0)' || (link.getAttribute('onclick') && link.getAttribute('onclick').includes('reportsController'))) {
      // Let the onclick handler deal with it, but prevent any default navigation
      if (href === 'javascript:void(0)') {
        event.preventDefault();
      }
    }
  }
}, true);


