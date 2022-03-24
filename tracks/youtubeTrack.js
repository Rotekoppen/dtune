const {
  createAudioResource,
} = require('@discordjs/voice');
const play = require('play-dl')
const Track = require('./track.js')

/**
 * Represents a youtube video
 * @type {YoutubeTrack}
 * @extends {Track}
 */
class YoutubeTrack extends Track {
  /**
   * @param {String} url - The Url of the video
   * @param {Object} ytMetadata - Metadata obtained from ytdl.getInfo()
   */
  constructor(url, ytMetadata) {
    super(url)
    this.type = "YoutubeTrack"
    if (ytMetadata.video_details) ytMetadata = ytMetadata.video_details
    this.id = ytMetadata.id
    this.extractMetadata(ytMetadata)
  }
  /**
   * Sets the info of the track according to data from ytdl.getInfo
   * @param {Object} ytMetadata - Data from ytdl.getInfo
   */
  extractMetadata(ytMetadata) {
    this.metadata.id = this.id
    this.metadata.type = this.type
    this.metadata.title = ytMetadata.title
    this.metadata.lengthFormatted = ytMetadata.durationRaw
    this.metadata.lengthSeconds = ytMetadata.durationInSec
    this.metadata.author = ytMetadata.channel.name
    this.metadata.authorUrl = ytMetadata.channel.url
    this.metadata.authorThumbnail = ytMetadata.channel.icons[ytMetadata.channel.icons.length - 1].url
    this.metadata.thumbnail = ytMetadata.thumbnails[ytMetadata.thumbnails.length - 1].url
  }

  /**
   * Preloads the track
   */
  async preload() {
    this.preloadedResource = await play.stream(await this.url)
  }

  /**
   * Creates an AudioResource and returns it
   * @return {Promise<?AudioResource>}
   */
  async play() {
    if (!this.preloadedResource) await this.preload()
    this.resource = createAudioResource(this.preloadedResource.stream, {
        inputType: this.preloadedResource.type
    })
    return this.resource
  }
}

module.exports = YoutubeTrack
