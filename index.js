const {
  joinVoiceChannel,
  createAudioPlayer,
  entersState,
  StreamType,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  generateDependencyReport,
} = require('@discordjs/voice');

const {
  EventEmitter
} = require('events');

/**
 * All the players with the guildId as the key
 * @type {Object}
 */
exports.players = {}

/**
 * Preloading can cause some playback issues, but it should work fine, mostly a debug option
 * @type {Boolean}
 */
exports.preloading = true

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
    this.player = createAudioPlayer()
    this.player.on("stateChange", (state) => {
      // Check if track is finished
      if (this.playing) {
        if (this.queue[0].resource.started && !this.queue[0].resource.audioPlayer) {
          this.playing = false
          if (this.startNextTrack(true) == null) {}
        }
      }
    })
    this.player.on("error", console.log)

    exports.events.emit('playerCreated', this);
  }

  /**
   * Join a voice channel
   * @param {VoiceChannel} voiceChannel - discord.js voiceChannel object to join
   */
  async join(voiceChannel) {
    let channel = voiceChannel.id
    let guildId = voiceChannel.guild.id

    const connection = joinVoiceChannel({
      channelId: channel,
      guildId: guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: true
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30e3)
      await connection.subscribe(this.player)

      if (this.connection) this.connection.destroy()
      this.channel = channel
      this.guildId = guildId
      this.connection = connection


      exports.events.emit('joinedVoiceChannel', this);

    } catch (error) {
      connection.destroy();
      throw error;
    }
  }

  /**
   * Starts the next track
   * @param  {Boolean} [shift=false] If the player should play the next element in the queue, or restart the current.
   * @param  {Boolean} [preloadNext=true] If the player should preload the next track for quicker playback.
   * @return {Promise<?Track>} The track that started playing.
   */
  async startNextTrack(shift = false, preloadNext = true) {
    if (shift) this.queue.shift();
    if (this.queue[0]) {
      let resource = await this.queue[0].play()
      this.player.play(resource)
      await entersState(this.player, AudioPlayerStatus.Playing, 5e3);
      this.playing = true

      exports.events.emit('playingTrack', this, this.queue[0])
      if (this.queue[1] && this.preloading) {
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
   * Add a track to the queue
   * @param  {Track} track - The track to be added to the queue
   * @return {Number} The queue length
   */
  addTrack(track) {
    this.queue.push(track)
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
}

exports.Player = Player

/**
 * Deletes the player for the specified guildID
 *
 * @param {GuildID} guildId
 */
exports.removePlayer = (guildId) => {
  exports.events.emit('playerDestroyed', guildId)
  exports.players[guildId].connection.destroy()
  exports.players[guildId].player.stop()
  exports.players[guildId] = undefined
  delete exports.players[guildId]
}

/**
 * Gets the player for the specified guildID
 *
 * @param {GuildID} guildId
 * @param {Boolean} [createPlayer=false] - If the player should be created if it doesn't exist
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

/**
 * Player was destroyed
 *
 * @event Player#playerDestroyed
 * @type {Object}
 * @property {GuildID} guildId
 */

/**
 * Player created event.
 *
 * @event Player#playerCreated
 * @type {object}
 * @property {Player} player
 * @property {Track} track - The track that was added
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
 * The eventemitter
 * @type {EventEmitter}
 */
exports.events = new EventEmitter();
