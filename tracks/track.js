const {
  createAudioResource,
} = require('@discordjs/voice');

const uniqid = require('uniqid');
/**
 * The track, represents a music file, or stream, handles creating a resource and preloading.
 * @type {Track}
 */
class Track {
  /**
   * @param {String} url - URL to stream from
   * @param {Snowflake} [requesterId=undefined] - The ID of the requester
   */
  constructor(url, requesterId = undefined, type = "Track") {
    this.type = type
    this.id = uniqid()
    this.uid = this.id
    this.preloadedResource = undefined
    this.url = url
    this.requesterId = requesterId
    this.info = {
      id: this.id,
      uid: this.uid,
      url: this.url,
      title: this.title,
      type: this.type
    }
  }
  /**
   * Preloads the track
   */
  async preload() {
    this.preloadedResource = this.url
  }
  /**
   * Creates an AudioResource and returns it
   * @return {Promise<?AudioResource>}
   */
  async play() {
    if (!this.preloadedResource) await this.preload()
    this.resource = createAudioResource(this.preloadedResource)
    return this.resource
  }
  /**
   * Formats seconds to (HH:)MM:SS
   * @param  {Number}  totalSeconds - The secounds to be converted
   * @param  {Boolean} [hideHours=true] - Hide the hours if there are none
   * @return {String}  Seconds formatted in (HH:)MM:SS
   */
  toHHMMSS(totalSeconds, hideHours = true) {
    let hours = Math.floor(totalSeconds / 3600)
    totalSeconds = totalSeconds % 3600
    let minutes = Math.floor(totalSeconds / 60)
    let seconds = totalSeconds % 60
    if (hours == 0 && hideHours) {
      return minutes + ":" + seconds
    }
    return hours + ":" + minutes + ":" + seconds
  }
}

module.exports = Track
