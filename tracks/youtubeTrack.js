const ytdl = require('ytdl-core');
const Track = require('./track.js')
/**
 * Represents a youtube video
 * @type {YoutubeTrack}
 * @extends {Track}
 */
class YoutubeTrack extends Track {
  /**
   * @param {String} url - The Url of the video
   * @param {Object} ytmetadata - Metadata obtained from ytdl.getInfo()
   * @param {Snowflake} [requesterId=undefined] - The ID of the requester
   */
  constructor(url, ytmetadata, requesterId = undefined, type = "YoutubeTrack") {
    super(url, requesterId, type)
    this.id = ytmetadata.videoDetails?.videoId
    if (this.type == "YoutubeTrack") {
      this.metadata = ytmetadata
      this.setInfo(ytmetadata)
    }
  }
  /**
   * Sets the info of the track according to data from ytdl.getInfo
   * @param {Object} ytmetadata - Data from ytdl.getInfo
   */
  setInfo(ytmetadata) {
    this.info.id = this.id
    this.info.type = this.type
    this.info.title = ytmetadata.videoDetails?.title
    this.info.lengthFormatted = this.toHHMMSS(ytmetadata.videoDetails?.lengthSeconds)
    this.info.lengthSeconds = ytmetadata.videoDetails?.lengthSeconds
    this.info.author = ytmetadata.videoDetails?.author.name
    this.info.authorUrl = ytmetadata.videoDetails?.author.channel_url
    this.info.authorThumbnail = ytmetadata.videoDetails?.author.thumbnails[ytmetadata.videoDetails.author.thumbnails.length - 1].url
    this.info.thumbnail = ytmetadata.videoDetails?.thumbnails[ytmetadata.videoDetails.thumbnails.length - 1].url
  }
  /**
   * Preloads the stream for smoother playback
   */
  async preload() {
    if (!this.metadata || !this.metadata.full) {
      this.metadata = await ytdl.getInfo(this.url)
      this.setInfo(this.metadata)
    }
    this.preloadedResource = await ytdl.downloadFromInfo(await this.metadata)
  }
}

module.exports = YoutubeTrack
