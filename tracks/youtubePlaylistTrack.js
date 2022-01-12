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
    super(ytmetadata.shortUrl, ytmetadata, requesterId, type)
    this.id = ytmetadata.id
    this.playlistUrl = ytmetadata.url
    this.playlistPosition = ytmetadata.index
    this.setInfo(ytmetadata)
  }
  /**
   * Sets the info of the track according to data from ytpl()
   * @param {Object} ytmetadata - Data from ytpl()
   */
  setInfo(ytmetadata) {
    if (ytmetadata.full) {
      YoutubeTrack.prototype.setInfo.call(this, ytmetadata)
    }else {
      this.info.id = this.id
      this.info.type = this.type
      this.info.title = ytmetadata.title
      this.info.lengthFormatted = ytmetadata.duration
      this.info.lengthSeconds = ytmetadata.durationSec
      this.info.author = ytmetadata.author.name
      this.info.authorUrl = ytmetadata.author.channel_url
      this.info.authorThumbnail = undefined
      this.info.thumbnail = ytmetadata.thumbnails[ytmetadata.thumbnails.length - 1].url
      this.info.playlistUrl = this.playlistUrl
      this.info.playlistPosition = this.playlistPosition
    }
  }
}

module.exports = YoutubePlaylistTrack
