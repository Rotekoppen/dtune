const ytsr = require('ytsr');
const play = require('play-dl')

const Track = require('./tracks/track');
const YoutubeTrack = require('./tracks/youtubeTrack');
const YoutubePlaylistTrack = require('./tracks/youtubePlaylistTrack');

/**
 * An interface for dTune that simplifies the code of commonly used functions
 */
class DTuneInterface {
  /**
   * @param {dTune} dtune - A dTune instance
   */
  constructor(dtune) {
    this.dtune = dtune
  }

  /**
   * Gets a player using a guild ID
   * @param  {GuildID} guildId
   * @param  {Boolean} [create=false] - If the player should be created if it doesn't exist
   * @return {Player}
   */
  getPlayer(guildId, create = false) {
    return this.dtune.getPlayer(guildId, create)
  }

  /**
   * Gets the queue for a guild using a guild ID
   * @param  {GuildID} guildId
   * @param  {Number}  [start=0] - What element to start getting the queue on
   * @param  {Number}  [stop=-1] - The element to stop getting the queue on
   * @param  {Boolean} [info=true] - If it only should get the simplified info of the track object, or the whole object
   * @return {?Track[]}
   */
  getQueue(guildId, start = 0, stop = -1, info = true) {
    const player = this.getPlayer(guildId)
    if (!player) return undefined

    const queue = {
      start,
      stop,
      length: player.queue.length,
      info,
      queue: []
    }

    player.queue.slice(start, stop).forEach((track, i) => {
      queue.queue.push(track.info)
    })

    return queue
  }
  /**
   * Creates a track from an URL
   * @param  {String} url
   * @return {Promise<Track>}
   */
  async createTrack(url) {
    return new Track(url)
  }
  /**
   * Creates a YoutubeTrack from an URL
   * @param  {String} url
   * @return {Promise<YoutubeTrack>}
   */
  async createYoutubeTrack(url) {
    const ytMetadata = await play.video_info(url)
    return new YoutubeTrack(url, ytMetadata)
  }
  /**
   * Creates an array with YoutubePlaylistTracks (Basically a YoutubeTrack) from an URL
   * @param  {String} url
   * @return {Promise<YoutubePlaylistTrack[]>}
   */
  async createYoutubePlaylistTrack(url) {
    const playlist = await play.playlist_info(url, { incomplete : true })
    const videos = []
    playlist.videos.forEach((video, i) => {
      console.log(video);
      videos.push(new YoutubePlaylistTrack(video.url, video))
    });
    return videos
  }
  /**
   * Finds out what type of track to create then creates it
   * @param  {String} url
   * @return {Promise<Track|YoutubeTrack|YoutubePlaylistTrack[]>}
   */
  async createTrackWithUrl(url) {
    // TODO: Rewrite for all to use play.validate
    // is youtube link
    if (/(youtu)(\.be|be\.com)\//.test(url)) {
      // is playlist or youtube video
      if (play.validate(url) == "yt_playlist") {
        return this.createYoutubePlaylistTrack(url)
      }
      if (/(?<!user)(\/|\?(v|vi)=)([a-zA-Z0-9-_]{11})/.test(url)) {
        return this.createYoutubeTrack(url)
      }
    }
    return this.createTrack(url)
  }

  /**
   * Creates a YoutubeTrack using a search Query
   * @param  {String} query - The search query
   * @return {Promise<YoutubeTrack>}
   */
  async createTrackWithSearch(query) {
    const search = await play.search(query, { source: { youtube: "video" }, limit: 10 })

    for (var i = 0; i < search.length; i++) {
      if (search[i].type == "video") {
        return await this.createYoutubeTrack(search.items[i].url)
      }
    }
    return
  }

  /**
   * Creates a track using a query, tries to find the right type, if not a link, searches for it
   * @param  {String}  query - Either a url or a search
   * @return {Promise<Track|YoutubeTrack|YoutubePlaylistTrack[]>}
   */
  async createTrackWithQuery(query) {
    if (/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(query)) {
      return this.createTrackWithUrl(query)
    } else {
      return this.createTrackWithSearch(query)
    }
  }
  /**
   * Adds the tracks to the queue, can be configured to start or create the player
   * @param {GuildID} guildId
   * @param {Track|Track[]}  track - The track to add
   * @param {Boolean} [dontStartPlayer=false] - Set to true if the player should start playing if nothing else is
   * @param {Boolean} [create=true] - Set to false if the player shouldn't be created
   * @return {Object} Info about added
   */
  async addTrack(guildId, track, dontStartPlayer = false, create = true) {
    const info = {playlist: false, started: false, track, guildId}
    const player = this.getPlayer(guildId, create)
    if (track.constructor !== Array) {
      player.addTrack(track)
    } else {
      track.forEach((item, i) => {
        player.addTrack(item)
        info.playlist = true
      });
    }

    if (!player.playing && !dontStartPlayer) {
      player.startNextTrack()
      info.started = true
    }
    return info
  }

  /**
   * Skips the currently playing song using a guild ID
   * @param  {GuildID}  guildId
   * @param  {Boolean} [create=false] - If the player should be created
   */
  async skip(guildId, create = false) {
    const player = this.getPlayer(guildId, create)
    await player.skipCurrentTrack()
  }
  /**
   * Shuffle the queue using a guild ID
   * @param  {GuildID} guildId
   */
  async shuffle(guildId) {
    const player = this.getPlayer(guildId)
    await player.shuffleQueue()
  }
  /**
   * Joines the voiceChannel inside the guild
   * @param  {GuildID}  guildId
   * @param  {VoiceChannel}  voiceChannel
   * @param  {Boolean} [create=true] - If the player should be created
   * @param  {Boolean} [forceJoin=false] - If it should try to connect, even when connected
   */
  async joinVoiceChannel(guildId, voiceChannel, create = true, forceJoin = false) {
    const player = this.getPlayer(guildId, create)
    if (!player) return undefined
    if (!player.connection | forceJoin) await player.join(voiceChannel)
  }
}

module.exports = DTuneInterface
