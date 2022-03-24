const YoutubeTrack = require('./youtubeTrack.js')

/**
 * Represents a youtube video from a playlist
 * @type {YoutubePlaylistTrack}
 * @extends {YoutubeTrack}
 */
class YoutubePlaylistTrack extends YoutubeTrack {
  /**
   * @param {String} url - The Url of the video
   * @param {Object} ytmetadata - Metadata obtained from ytpl()
   */
  constructor(url, ytmetadata) {
    super(url, ytmetadata)
    this.type = "YoutubePlaylistTrack"
  }
}

module.exports = YoutubePlaylistTrack
