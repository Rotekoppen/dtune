// ytdl is being replaced due to random aborts,
// TODO: Replace other ytdl parts too
// TODO: Rewrite youtubeTrack & youtubePlaylistTrack because they're shit
// const ytdl = require('ytdl-core');
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
   * @param {Snowflake} [requesterId=undefined] - The ID of the requester
   */
  constructor(url, ytMetadata, requesterId = undefined, type = "YoutubeTrack") {
    if (ytMetadata.video_details) ytMetadata = ytMetadata.video_details
    super(url, requesterId, type)
    this.id = ytMetadata.id
    this.setInfo(ytMetadata)
  }
  /**
   * Sets the info of the track according to data from ytdl.getInfo
   * @param {Object} ytMetadata - Data from ytdl.getInfo
   */
  setInfo(ytMetadata) {
    console.log(ytMetadata);
    this.info.id = this.id
    this.info.type = this.type
    this.info.title = ytMetadata.title
    this.info.lengthFormatted = ytMetadata.durationRaw
    this.info.lengthSeconds = ytMetadata.durationInSec
    this.info.author = ytMetadata.channel.name
    this.info.authorUrl = ytMetadata.channel.url
    this.info.authorThumbnail = ytMetadata.channel.icons[ytMetadata.channel.icons.length - 1].url
    this.info.thumbnail = ytMetadata.thumbnails[ytMetadata.thumbnails.length - 1].url
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
