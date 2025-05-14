/**
 * Shared utility functions for song data processing
 * Used by both songs.js and direct-yaml-loader.js
 */

/**
 * Creates a mapping of song codes to organization codes
 * @param {Object} rightsAdminSongs - The rights admin data from rights-admin-songs.yml
 * @returns {Object} A map of song codes to organization codes
 */
export function createSongOrgMap(rightsAdminSongs) {
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
export function processSongData(songPlays, songsMap, performersMap, orgsMap, songOrgMap) {
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