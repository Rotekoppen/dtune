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
   * @param {Snowflake} [requesterId=undefined] - The ID of the requester
   */
  constructor(url, ytmetadata, requesterId = undefined, type = "YoutubePlaylistTrack") {
    super(url, ytmetadata, requesterId, type)
  }
}

module.exports = YoutubePlaylistTrack
