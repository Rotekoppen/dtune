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
   */
  constructor(url) {
    this.type = "Track"
    this.id = url
    this.uid = uniqid()
    this.preloadedResource = undefined
    this.url = url
    this.title = url
    this.metadata = {
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
}

module.exports = Track
