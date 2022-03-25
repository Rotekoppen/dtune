const {
  EventEmitter
} = require('events');
const {
  joinVoiceChannel,
  createAudioPlayer,
  entersState,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require('@discordjs/voice');

/**
 * Player was destroyed
 *
 * @event Player#playerDestroyed
 * @type {Object}
 * @property {GuildID} guildId
 */

/**
 * Player skipped track
 *
 * @event Player#skippedTrack
 * @type {object}
 * @property {Player} player
 */

/**
 * Player created event.
 *
 * @event Player#playerCreated
 * @type {object}
 * @property {Player} player
 */

/**
 * Player joined a voice channel
 *
 * @event Player#joinedVoiceChannel
 * @type {object}
 * @property {Player} player
 */

/**
 * Player started playing a track.
 *
 * @event Player#playingTrack
 * @type {object}
 * @property {Player} player
 * @property {Track} track - The track that was started
 */

/**
 * Player started playing a track.
 *
 * @event Player#trackEnded
 * @type {object}
 * @property {Player} player
 * @property {Track} track - The track that was started
 */

/**
 * The eventemitter
 * @type {EventEmitter}
 */
exports.events = new EventEmitter();

/**
 * Object containing all players by guildID
 * @type {Object}
 */
module.exports.players = {}

/** The player, handles joining, playback and queueing of tracks. It shouldn't be necessary to create this object as getPlayer will create it for you.*/
class Player {
  /**
   * @param {GuildID} guildId
   */
  constructor(guildId) {
    exports.players[guildId] = this
    this.guildId = guildId
    this.queue = []
    this.playing = false
    this.paused = false
    this.repeat = "none"
    this.player = createAudioPlayer()
    this.player.on("error", console.log)

    // Code that starts the next track on end
    this.player.on("stateChange", (state) => {
      if (this.playing && !this.paused) {
        if (state.status = "idle") {
          this.playing = false
          exports.events.emit('trackEnded', this, this.queue[0])
          if (this.startNextTrack(true) == null) {}
        }
      }
    })

    exports.events.emit('playerCreated', this);
  }

  /**
   * Join a voice channel
   * @param {VoiceChannel} voiceChannel - discord.js voiceChannel object to join
   */
  async join(voiceChannel) {
    try {
      let channel = voiceChannel.id
      let guildId = voiceChannel.guild.id

      const connection = joinVoiceChannel({
        channelId: channel,
        guildId: guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 30e3)
      connection.subscribe(this.player)

      if (this.connection) this.connection.destroy()
      this.channel = channel
      this.guildId = guildId
      this.connection = connection

      exports.events.emit('joinedVoiceChannel', this);

    } catch (error) {
      connection.destroy();
      return error;
    }
  }

  /**
   * Join a voice channel with extra options
   * @param  {VoiceChannel}  voiceChannel
   * @param  {Boolean} [forceJoin=false] - If it should try to connect, even when connected
   */
  async joinNice(voiceChannel, forceJoin = false) {
    if (!this.connection | forceJoin) return await this.join(voiceChannel)
  }

  /**
   * Pauses the playback
   * @return {Promise<boolean>} True if it could pause
   */
  async pause() {
    this.paused = true
    return this.player.pause()
  }

  /**
   * Set the repeat mode
   * @param {String} [mode="none"]  "none|all|single"
   */
  setRepeat(mode="none") {
    this.repeat = mode;
  }

  /**
   * Unpauses the playback
   * @return {Promise<boolean>} True if it could unpause
   */
  async unpause() {
    const success = this.player.unpause()
    this.paused = false
    return success
  }

  /**
   * Starts the next track
   * @param  {Boolean} [shift=false] If the player should play the next element in the queue, or restart the current. Ignored if player.repeat is "single"
   * @param  {Boolean} [preloadNext=true] If the player should preload the next track for quicker playback.
   * @return {Promise<?Track>} The track that started playing.
   */
  async startNextTrack(shift = false, preloadNext = true) {
    let prev = undefined
    if (shift && this.repeat != "single") prev = this.queue.shift();

    if (this.repeat == "all") {
      this.queue.push(prev)
    }

    if (this.queue[0]) {
      let resource = await this.queue[0].play()
      this.player.play(resource)
      await entersState(this.player, AudioPlayerStatus.Playing, 5e3);
      this.playing = true

      exports.events.emit('playingTrack', this, this.queue[0])
      if (this.queue[1] && preloadNext) {
        this.queue[1].preload()
      }
      return this.queue[0]
    } else {
      exports.removePlayer(this.guildId)
    }
    return
  }

  /**
   * Skip the currently playing track.
   */
  skipCurrentTrack() {
    if (this.queue[0]) {
      exports.events.emit('skippedTrack', this)
      this.player.stop()
    }
  }

  /**
   * Adds the tracks to the queue, can be configured to start or create the player
   * @param {GuildID} guildId
   * @param {Track|Track[]}  track - The track(s) to add
   * @param {Boolean} [dontStartPlayer=false] - Set to true if the player should start playing if nothing else is
   * @param {Boolean} [create=true] - Set to false if the player shouldn't be created
   * @return {Object} Info about added
   */
  async addTrackNice(track, unshift = false, dontStartPlayer = false) {
    const info = {playlist: false, started: false, track}
    if (track.constructor !== Array) {
      this.addTrack(track, unshift)
    } else {
      track.forEach((item) => {
        this.addTrack(item, unshift)
        info.playlist = true
      });
    }

    if (!this.playing && !dontStartPlayer) {
      this.startNextTrack()
      info.started = true
    }
    return info
  }

  /**
   * Add a track to the queue
   * @param  {Track} track - The track to be added to the queue
   * @return {Number} The queue length
   */
  addTrack(track, unshift = false) {
    this.queue[unshift ? 'unshift' : 'push'](track)
    exports.events.emit('addedTrack', this, track)
    return this.queue.length
  }

  /**
   * Shuffles the queue
   */
  shuffleQueue() {
    let playing = this.queue.shift()
    this.queue.sort(() => Math.random() - 0.5);
    this.queue.unshift(playing)
  }

  /**
   * Gets the current queue
   * @param  {Number}  [start=0]   Index to start from
   * @param  {Number}  [stop=-1]   Index to end on
   * @param  {Boolean} [info=true] Include the whole Track object, or just the info
   * @return {object}  The queue object
   */
  getQueue(start = 0, stop = -1, metadata = true) {
    const queue = { start, stop, length: this.queue.length, metadata, queue: [] }

    this.queue.slice(start, stop).forEach((track) => {
      metadata ?
      queue.queue.push(track.metadata)
      :
      queue.queue.push(track)
    })

    return queue
  }
}

exports.Player = Player

/**
 * Deletes the player for the specified guildID
 * @param {GuildID} guildId
 */
exports.removePlayer = (guildId) => {
  if (exports.players[guildId]) {
    exports.events.emit('playerDestroyed', guildId)
    exports.players[guildId].connection.destroy()
    exports.players[guildId].player.stop()
    delete exports.players[guildId]
  }
}

/**
 * Gets the player for the specified guildID
 * @param {GuildID} guildId
 * @param {Boolean} [createPlayer=false] - If the player should be created if it doesn't exist, will create of type class if specified
 * @return {Player}
 */
exports.getPlayer = (guildId, createPlayer = false) => {
  if (exports.players[guildId]) {
    return exports.players[guildId]
  } else {
    if (createPlayer) {
      return new exports.Player(guildId)
    } else {
      return
    }
  }
}
