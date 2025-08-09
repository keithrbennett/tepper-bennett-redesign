/**
 * All Data Report - JavaScript equivalent of Rails AllDataReport
 * Shows comprehensive data across all entities
 */


class AllDataReport extends BaseReport {
  constructor() {
    super('all');
    this.records = [];
  }

  async populate() {
    try {
      // Load all data sources
      const elvisSongs = await this.loadDataFromYAML('elvis-songs.yml');
      const nonElvisSongs = await this.loadDataFromYAML('non-elvis-songs.yml');
      const performers = await this.loadDataFromYAML('performers.yml');
      const genres = await this.loadDataFromYAML('genres.yml');
      const movies = await this.loadDataFromYAML('movies.yml');
      const organizations = await this.loadDataFromYAML('organizations.yml');
      const writers = await this.loadDataFromYAML('writers.yml');
      
      // Combine all data
      this.records = {
        songs: [...elvisSongs, ...nonElvisSongs],
        performers: performers,
        genres: genres,
        movies: movies,
        organizations: organizations,
        writers: writers
      };
      
    } catch (error) {
      console.error('Error populating AllDataReport:', error);
      this.records = {
        songs: [],
        performers: [],
        genres: [],
        movies: [],
        organizations: [],
        writers: []
      };
    }
  }

  toHTML() {
    const hasData = Object.values(this.records).some(arr => arr.length > 0);
    
    if (!hasData) {
      return '<p class="text-gray-500">No data available for this report.</p>';
    }

    let html = '<div class="space-y-8">';
    
    if (this.records.songs.length > 0) {
      html += `
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Songs (${this.records.songs.length})</h3>
          ${this.createTable(this.records.songs.map(s => [s.code, s.name, s.movie || 'N/A']), ['Code', 'Name', 'Movie'], 'all-songs-table')}
        </div>
      `;
    }
    
    if (this.records.performers.length > 0) {
      html += `
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Performers (${this.records.performers.length})</h3>
          ${this.createTable(this.records.performers.map(p => [p.code, p.name]), ['Code', 'Name'], 'all-performers-table')}
        </div>
      `;
    }
    
    if (this.records.genres.length > 0) {
      html += `
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Genres (${this.records.genres.length})</h3>
          ${this.createTable(this.records.genres.map(g => [g.code, g.name]), ['Code', 'Name'], 'all-genres-table')}
        </div>
      `;
    }
    
    if (this.records.movies.length > 0) {
      html += `
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Movies (${this.records.movies.length})</h3>
          ${this.createTable(this.records.movies.map(m => [m.code, m.name]), ['Code', 'Name'], 'all-movies-table')}
        </div>
      `;
    }
    
    if (this.records.organizations.length > 0) {
      html += `
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Organizations (${this.records.organizations.length})</h3>
          ${this.createTable(this.records.organizations.map(o => [o.code, o.name]), ['Code', 'Name'], 'all-organizations-table')}
        </div>
      `;
    }
    
    if (this.records.writers.length > 0) {
      html += `
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Writers (${this.records.writers.length})</h3>
          ${this.createTable(this.records.writers.map(w => [w.code, w.name]), ['Code', 'Name'], 'all-writers-table')}
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  }

  toText() {
    let output = 'ALL DATA REPORT\n';
    output += '='.repeat(50) + '\n\n';
    
    if (this.records.songs.length > 0) {
      output += `Songs (${this.records.songs.length}):\n`;
      output += '-'.repeat(20) + '\n';
      this.records.songs.forEach(song => {
        output += `${song.code}: ${song.name}`;
        if (song.movie) output += ` (${song.movie})`;
        output += '\n';
      });
      output += '\n';
    }
    
    if (this.records.performers.length > 0) {
      output += `Performers (${this.records.performers.length}):\n`;
      output += '-'.repeat(20) + '\n';
      this.records.performers.forEach(performer => {
        output += `${performer.code}: ${performer.name}\n`;
      });
      output += '\n';
    }
    
    if (this.records.genres.length > 0) {
      output += `Genres (${this.records.genres.length}):\n`;
      output += '-'.repeat(20) + '\n';
      this.records.genres.forEach(genre => {
        output += `${genre.code}: ${genre.name}\n`;
      });
      output += '\n';
    }
    
    if (this.records.movies.length > 0) {
      output += `Movies (${this.records.movies.length}):\n`;
      output += '-'.repeat(20) + '\n';
      this.records.movies.forEach(movie => {
        output += `${movie.code}: ${movie.name}\n`;
      });
      output += '\n';
    }
    
    if (this.records.organizations.length > 0) {
      output += `Organizations (${this.records.organizations.length}):\n`;
      output += '-'.repeat(20) + '\n';
      this.records.organizations.forEach(organization => {
        output += `${organization.code}: ${organization.name}\n`;
      });
      output += '\n';
    }
    
    if (this.records.writers.length > 0) {
      output += `Writers (${this.records.writers.length}):\n`;
      output += '-'.repeat(20) + '\n';
      this.records.writers.forEach(writer => {
        output += `${writer.code}: ${writer.name}\n`;
      });
      output += '\n';
    }
    
    return `<pre><code>${this.escapeHTML(output)}</code></pre>`;
  }

  toJSON() {
    return `<pre><code>${JSON.stringify(this.records, null, 2)}</code></pre>`;
  }

  toYAML() {
    let yaml = 'report_type: all\n';
    yaml += `total_counts:\n`;
    yaml += `  songs: ${this.records.songs.length}\n`;
    yaml += `  performers: ${this.records.performers.length}\n`;
    yaml += `  genres: ${this.records.genres.length}\n`;
    yaml += `  movies: ${this.records.movies.length}\n`;
    yaml += `  organizations: ${this.records.organizations.length}\n`;
    yaml += `  writers: ${this.records.writers.length}\n`;
    
    Object.entries(this.records).forEach(([key, value]) => {
      if (value.length > 0) {
        yaml += `\n${key}:\n`;
        value.forEach(item => {
          yaml += `  - code: ${item.code}\n`;
          yaml += `    name: ${item.name}\n`;
          if (item.movie) {
            yaml += `    movie: ${item.movie}\n`;
          }
        });
      }
    });
    
    return `<pre><code>${yaml}</code></pre>`;
  }
}

/**
 * Songs Report - JavaScript report for all songs (Elvis and non-Elvis)
 * Combines data from both elvis-songs.yml and non-elvis-songs.yml
 */

class SongsReport extends BaseReport {
  constructor() {
    super('songs');
    this.records = [];
  }

  async populate() {
    try {
      // Load both Elvis and non-Elvis songs
      const elvisSongs = await this.loadDataFromYAML('elvis-songs.yml');
      const nonElvisSongs = await this.loadDataFromYAML('non-elvis-songs.yml');
      
      // Combine all songs
      this.records = [...elvisSongs, ...nonElvisSongs];
      this.tuples = this.records.map(record => [record.code, record.name, record.movie || '']);
    } catch (error) {
      console.error('Error populating SongsReport:', error);
      this.records = [];
      this.tuples = [];
    }
  }

  toHTML() {
    const tableId = 'songs-report-table';
    const columnHeadings = ['Code', 'Name', 'Movie'];
    
    if (this.records.length === 0) {
      return '<p class="text-gray-500">No songs data available for this report.</p>';
    }

    return this.createTable(this.tuples, columnHeadings, tableId);
  }

  toText() {
    if (this.records.length === 0) {
      return 'No songs data available for this report.';
    }

    let output = 'SONGS REPORT\n';
    output += '=' .repeat(50) + '\n\n';
    
    const maxWidth = Math.max(...this.records.map(r => r.code.length));
    
    this.records.forEach(record => {
      output += `${record.code.padEnd(maxWidth)}  ${record.name}`;
      if (record.movie) {
        output += ` (${record.movie})`;
      }
      output += '\n';
    });
    
    output += `\nTotal: ${this.records.length} songs\n`;
    return `<pre><code>${this.escapeHTML(output)}</code></pre>`;
  }

  toJSON() {
    return `<pre><code>${JSON.stringify({
      report_type: this.reportType,
      total_count: this.records.length,
      records: this.records
    }, null, 2)}</code></pre>`;
  }

  toYAML() {
    if (this.records.length === 0) {
      return `<pre><code>report_type: ${this.reportType}\ntotal_count: 0\nrecords: []</code></pre>`;
    }

    let yaml = `report_type: ${this.reportType}\n`;
    yaml += `total_count: ${this.records.length}\n`;
    yaml += 'records:\n';
    
    this.records.forEach(record => {
      yaml += `  - code: ${record.code}\n`;
      yaml += `    name: ${record.name}\n`;
      if (record.movie) {
        yaml += `    movie: ${record.movie}\n`;
      }
    });
    
    return `<pre><code>${yaml}</code></pre>`;
  }
}

/**
 * Code Name Report - JavaScript equivalent of Rails CodeNameReport
 * Used for entities with code and name fields (Songs, Performers, Genres, etc.)
 */

class CodeNameReport extends BaseReport {
  constructor(reportType, dataFile) {
    super(reportType);
    this.dataFile = dataFile;
    this.records = [];
  }

  async populate() {
    try {
      this.records = await this.loadDataFromYAML(this.dataFile);
      this.tuples = this.records.map(record => [record.code, record.name]);
    } catch (error) {
      console.error('Error populating CodeNameReport:', error);
      this.records = [];
      this.tuples = [];
    }
  }

  toHTML() {
    const tableId = `${this.reportType}-report-table`;
    const columnHeadings = ['Code', 'Name'];
    
    if (this.records.length === 0) {
      return '<p class="text-gray-500">No data available for this report.</p>';
    }

    return this.createTable(this.tuples, columnHeadings, tableId);
  }

  toText() {
    if (this.records.length === 0) {
      return 'No data available for this report.';
    }

    let output = `${this.reportType.toUpperCase()} REPORT\n`;
    output += '=' .repeat(50) + '\n\n';
    
    const maxWidth = Math.max(...this.records.map(r => r.code.length));
    
    this.records.forEach(record => {
      output += `${record.code.padEnd(maxWidth)}  ${record.name}\n`;
    });
    
    output += `\nTotal: ${this.records.length} ${this.reportType}\n`;
    return `<pre><code>${this.escapeHTML(output)}</code></pre>`;
  }

  toJSON() {
    return `<pre><code>${JSON.stringify({
      report_type: this.reportType,
      total_count: this.records.length,
      records: this.records
    }, null, 2)}</code></pre>`;
  }

  toYAML() {
    if (this.records.length === 0) {
      return `<pre><code>report_type: ${this.reportType}\ntotal_count: 0\nrecords: []</code></pre>`;
    }

    let yaml = `report_type: ${this.reportType}\n`;
    yaml += `total_count: ${this.records.length}\n`;
    yaml += 'records:\n';
    
    this.records.forEach(record => {
      yaml += `  - code: ${record.code}\n`;
      yaml += `    name: ${record.name}\n`;
    });
    
    return `<pre><code>${yaml}</code></pre>`;
  }
}

/**
 * Song Plays Report - JavaScript equivalent of Rails SongPlaysReport
 */

class SongPlaysReport extends BaseReport {
  constructor() {
    super('song-plays');
    this.records = [];
  }

  async populate() {
    try {
      // Load song plays data
      const songPlaysData = await this.loadDataFromYAML('song-plays.yml');
      
      // Load songs data for more detailed information
      const elvisSongs = await this.loadDataFromYAML('elvis-songs.yml');
      const nonElvisSongs = await this.loadDataFromYAML('non-elvis-songs.yml');
      const allSongs = [...elvisSongs, ...nonElvisSongs];
      
      // Load performers data
      const performers = await this.loadDataFromYAML('performers.yml');
      
      // Process song plays
      this.records = songPlaysData.map(songPlay => {
        const song = allSongs.find(s => s.code === songPlay.song_code);
        const performersList = songPlay.performers?.map(performerCode => 
          performers.find(p => p.code === performerCode)
        ).filter(Boolean) || [];
        
        return {
          song_code: songPlay.song_code,
          song_name: song?.name || 'Unknown Song',
          performers: performersList.map(p => ({ code: p.code, name: p.name })),
          youtube_key: songPlay.youtube_key || null,
          movie: song?.movie || null
        };
      });
      
    } catch (error) {
      console.error('Error populating SongPlaysReport:', error);
      this.records = [];
    }
  }

  toHTML() {
    if (this.records.length === 0) {
      return '<p class="text-gray-500">No song plays data available.</p>';
    }

    const tableId = 'song-plays-report-table';
    const columnHeadings = ['Song Code', 'Song Name', 'Performers', 'Movie', 'YouTube Key'];
    
    const tableData = this.records.map(record => [
      record.song_code,
      record.song_name,
      record.performers.map(p => p.name).join(', ') || 'N/A',
      record.movie || 'N/A',
      record.youtube_key ? `<a href="https://www.youtube.com/watch?v=${record.youtube_key}" target="_blank" class="text-blue-600 hover:text-blue-800">Link</a>` : 'N/A'
    ]);

    return this.createTable(tableData, columnHeadings, tableId);
  }

  toText() {
    if (this.records.length === 0) {
      return 'No song plays data available.';
    }

    let output = 'SONG PLAYS REPORT\n';
    output += '='.repeat(50) + '\n\n';
    
    this.records.forEach(record => {
      output += `Song: ${record.song_code} - ${record.song_name}\n`;
      if (record.performers.length > 0) {
        output += `Performers: ${record.performers.map(p => p.name).join(', ')}\n`;
      }
      if (record.movie) {
        output += `Movie: ${record.movie}\n`;
      }
      if (record.youtube_key) {
        output += `YouTube: https://www.youtube.com/watch?v=${record.youtube_key}\n`;
      }
      output += '\n';
    });
    
    output += `\nTotal: ${this.records.length} song plays\n`;
    return `<pre><code>${this.escapeHTML(output)}</code></pre>`;
  }
}

/**
 * Song Performers Report - Shows song-performer relationships
 */

class SongPerformersReport extends BaseReport {
  constructor() {
    super('song-performers');
    this.records = [];
  }

  async populate() {
    try {
      // Load song plays data which contains song-performer relationships
      const songPlaysData = await this.loadDataFromYAML('song-plays.yml');
      
      // Load songs data
      const elvisSongs = await this.loadDataFromYAML('elvis-songs.yml');
      const nonElvisSongs = await this.loadDataFromYAML('non-elvis-songs.yml');
      const allSongs = [...elvisSongs, ...nonElvisSongs];
      
      // Load performers data
      const performers = await this.loadDataFromYAML('performers.yml');
      
      // Create song-performer relationships
      this.records = [];
      
      songPlaysData.forEach(songPlay => {
        const song = allSongs.find(s => s.code === songPlay.song_code);
        if (!song) return;
        
        const performersList = songPlay.performers?.map(performerCode => 
          performers.find(p => p.code === performerCode)
        ).filter(Boolean) || [];
        
        performersList.forEach(performer => {
          this.records.push({
            song_code: song.code,
            song_name: song.name,
            performer_code: performer.code,
            performer_name: performer.name,
            movie: song.movie || null
          });
        });
      });
      
    } catch (error) {
      console.error('Error populating SongPerformersReport:', error);
      this.records = [];
    }
  }

  toHTML() {
    if (this.records.length === 0) {
      return '<p class="text-gray-500">No song-performer data available.</p>';
    }

    const tableId = 'song-performers-report-table';
    const columnHeadings = ['Song Code', 'Song Name', 'Performer Code', 'Performer Name', 'Movie'];
    
    const tableData = this.records.map(record => [
      record.song_code,
      record.song_name,
      record.performer_code,
      record.performer_name,
      record.movie || 'N/A'
    ]);

    return this.createTable(tableData, columnHeadings, tableId);
  }

  toText() {
    if (this.records.length === 0) {
      return 'No song-performer data available.';
    }

    let output = 'SONG PERFORMERS REPORT\n';
    output += '='.repeat(50) + '\n\n';
    
    this.records.forEach(record => {
      output += `${record.song_name} by ${record.performer_name}`;
      if (record.movie) {
        output += ` (Movie: ${record.movie})`;
      }
      output += '\n';
    });
    
    output += `\nTotal: ${this.records.length} song-performer relationships\n`;
    return `<pre><code>${this.escapeHTML(output)}</code></pre>`;
  }
}

/**
 * Song Genres Report - Shows song-genre relationships
 */

class SongGenresReport extends BaseReport {
  constructor() {
    super('song-genres');
    this.records = [];
  }

  async populate() {
    try {
      // Load songs with genres data
      const elvisSongs = await this.loadDataFromYAML('elvis-songs.yml');
      const nonElvisSongs = await this.loadDataFromYAML('non-elvis-songs.yml');
      const allSongs = [...elvisSongs, ...nonElvisSongs];
      
      // Create song-genre relationships
      this.records = [];
      
      allSongs.forEach(song => {
        if (song.genres && song.genres.length > 0) {
          song.genres.forEach(genre => {
            this.records.push({
              song_code: song.code,
              song_name: song.name,
              genre: genre,
              movie: song.movie || null
            });
          });
        }
      });
      
    } catch (error) {
      console.error('Error populating SongGenresReport:', error);
      this.records = [];
    }
  }

  toHTML() {
    if (this.records.length === 0) {
      return '<p class="text-gray-500">No song-genre data available.</p>';
    }

    const tableId = 'song-genres-report-table';
    const columnHeadings = ['Song Code', 'Song Name', 'Genre', 'Movie'];
    
    const tableData = this.records.map(record => [
      record.song_code,
      record.song_name,
      record.genre,
      record.movie || 'N/A'
    ]);

    return this.createTable(tableData, columnHeadings, tableId);
  }

  toText() {
    if (this.records.length === 0) {
      return 'No song-genre data available.';
    }

    let output = 'SONG GENRES REPORT\n';
    output += '='.repeat(50) + '\n\n';
    
    this.records.forEach(record => {
      output += `${record.song_name} - ${record.genre}`;
      if (record.movie) {
        output += ` (Movie: ${record.movie})`;
      }
      output += '\n';
    });
    
    output += `\nTotal: ${this.records.length} song-genre relationships\n`;
    return `<pre><code>${this.escapeHTML(output)}</code></pre>`;
  }
}