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
    return {
      'all': {
        title: 'All Data',
        report: new AllDataReport()
      },
      'songs': {
        title: 'Songs',
        report: new CodeNameReport('songs', 'elvis-songs.yml')
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
  }

  async showReportsIndex() {
    // Show the modal with reports list
    this.showReportsModal();
  }

  showReportsModal() {
    // Remove any existing modal
    const existingModal = document.getElementById('reports-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Debug: check if we have reports data
    console.log('Reports metadata:', Object.keys(this.reportsMetadata));
    console.log('Number of reports:', Object.entries(this.reportsMetadata).length);
    
    // Create the actual reports modal
    const modalHTML = `
      <div id="reports-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      ">
        <div style="
          background: white;
          border-radius: 8px;
          max-width: 900px;
          max-height: 80vh;
          width: 100%;
          overflow-y: auto;
          padding: 30px;
          position: relative;
        ">
          <button 
            onclick="reportsController.closeReportsModal()"
            style="
              position: absolute;
              top: 15px;
              right: 15px;
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
            "
          >
            ×
          </button>
          
          <h1 class="text-3xl font-bold text-gray-900 mb-6">Available Reports</h1>
          <p class="text-gray-600 mb-8">Click on any report title below to view:</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${Object.entries(this.reportsMetadata).map(([key, metadata]) => `
              <div style="
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                transition: all 0.2s;
              " class="hover:shadow-md">
                <h3 class="text-xl font-semibold text-gray-900 mb-3">
                  <a 
                    href="javascript:void(0)" 
                    onclick="reportsController.showReportInModal('${key}')"
                    class="text-blue-600 hover:text-blue-800 transition-colors duration-200 underline cursor-pointer"
                  >
                    ${metadata.title}
                  </a>
                </h3>
                <p class="text-sm text-gray-500 mb-4">Click the title above to view</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Add modal to the page
    console.log('Adding modal to page...');
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal should now be visible');
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

  async showReportInModal(reportType) {
    const metadata = this.reportsMetadata[reportType];
    if (!metadata) return;

    const modal = document.getElementById('reports-modal');
    if (!modal) return;

    // Show loading state
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 8px;
        max-width: 1200px;
        max-height: 90vh;
        width: 100%;
        overflow-y: auto;
        padding: 30px;
        position: relative;
      ">
        <button 
          onclick="reportsController.closeReportsModal()"
          style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
          "
        >
          ×
        </button>
        
        <div style="text-align: center; padding: 50px;">
          <div style="border: 4px solid #f3f4f6; border-top: 4px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
          <p style="margin-top: 20px; color: #6b7280;">Loading report...</p>
        </div>
      </div>
    `;

    try {
      // Populate the report with data
      await metadata.report.populate();
      this.currentReport = metadata.report;
      this.currentFormat = 'html';
      
      const reportHTML = `
        <div style="
          background: white;
          border-radius: 8px;
          max-width: 1200px;
          max-height: 90vh;
          width: 100%;
          overflow-y: auto;
          padding: 30px;
          position: relative;
        ">
          <button 
            onclick="reportsController.closeReportsModal()"
            style="
              position: absolute;
              top: 15px;
              right: 15px;
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
            "
          >
            ×
          </button>
          
          <button 
            onclick="reportsController.showReportsModal()"
            style="
              margin-bottom: 20px;
              background: #6b7280;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
            "
          >
            ← Back to Reports
          </button>
          
          <h1 class="text-3xl font-bold text-gray-900 mb-6">Report: ${metadata.title}</h1>
          
          <div style="margin-bottom: 20px;">
            <span style="margin-right: 10px; font-weight: 500;">Format:</span>
            ${['html', 'text', 'json', 'yaml'].map(format => `
              <button 
                onclick="reportsController.changeFormatInModal('${format}')"
                style="
                  margin-right: 5px;
                  padding: 6px 12px;
                  border: 1px solid #d1d5db;
                  border-radius: 4px;
                  cursor: pointer;
                  background: ${this.currentFormat === format ? '#3b82f6' : '#fff'};
                  color: ${this.currentFormat === format ? '#fff' : '#374151'};
                "
              >
                ${format.toUpperCase()}
              </button>
            `).join('')}
          </div>
          
          <div style="border: 1px solid #e5e7eb; border-radius: 4px; padding: 20px; background: #f9fafb;">
            <div id="report-content">
              ${this.currentReport.content(this.currentFormat)}
            </div>
          </div>
        </div>
      `;

      modal.innerHTML = reportHTML;

    } catch (error) {
      console.error('Error loading report:', error);
      modal.innerHTML = `
        <div style="
          background: white;
          border-radius: 8px;
          max-width: 600px;
          padding: 30px;
          position: relative;
        ">
          <button 
            onclick="reportsController.closeReportsModal()"
            style="
              position: absolute;
              top: 15px;
              right: 15px;
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
            "
          >
            ×
          </button>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 16px;">
            <h2 style="color: #dc2626; margin: 0 0 8px 0;">Error Loading Report</h2>
            <p style="color: #991b1b; margin: 0;">There was an error loading the report. Please try again later.</p>
          </div>
        </div>
      `;
    }
  }

  changeFormatInModal(format) {
    this.currentFormat = format;
    
    // Update button states
    document.querySelectorAll('#reports-modal button').forEach(button => {
      const onclick = button.getAttribute('onclick');
      if (onclick && onclick.includes('changeFormatInModal')) {
        const buttonFormat = onclick.match(/changeFormatInModal\('([^']+)'\)/)[1];
        if (buttonFormat === format) {
          button.style.background = '#3b82f6';
          button.style.color = '#fff';
        } else {
          button.style.background = '#fff';
          button.style.color = '#374151';
        }
      }
    });

    // Update content
    const contentDiv = document.getElementById('report-content');
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
    
    // Store scroll position before any action
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    window._preReportsScrollPosition = scrollPosition;
    
    // Call the modal function
    reportsController.showReportsModal();
    
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

