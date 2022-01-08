const ytsr = require('ytsr');
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

module.exports = (dtune) => {
  const {Track, YoutubeTrack, YoutubePlaylistTrack} = dtune
  function getPlayer(guildId, create=false) {
    return dtune.getPlayer(guildId, create)
  }

  function getQueue(guildId, start=0, stop=-1, info=true) {
    const player = getPlayer(guildId)
    if (!player) return undefined

    const queue = {start, stop, length: player.queue.length, info, queue: []}

    player.queue.slice(start, stop).forEach((track, i) => {
      queue.queue.push(track.info)
    })

    return queue
  }

  async function youtube(url) {
    const ytmetadata = await ytdl.getInfo(url)
    return new YoutubeTrack(url, ytmetadata)
  }
  async function http(url) {
    return new Track(url)
  }
  async function ytPlaylist(url) {
    const playlist = await ytpl(url);
    const videos = []
    playlist.items.forEach((item, i) => {
      videos.push(new YoutubePlaylistTrack(item.shortUrl, item))
    });
    return videos
  }
  async function any(url) {
    // is youtube link
    if (/(youtu)(\.be|be\.com)\//.test(url)) {
      // is playlist or youtube video
      if (ytpl.validateID(url)) {
        return ytPlaylist(url)
      }
      if (/(?<!user)(\/|\?(v|vi)=)([a-zA-Z0-9-_]{11})/.test(url)) {
        return youtube(url)
      }
    }
    return http(url)
  }

  makeTrackWithUrl = {any, http, youtube, ytPlaylist}

  async function addTrack(guildId, track, dontStartPlayer=false, create=true) {
    const player = getPlayer(guildId, create)
    if (track.constructor !== Array) {
      player.addTrack(track)
    }else {
      track.forEach((item, i) => {
        player.addTrack(item)
      });
    }

    if (!player.playing && !dontStartPlayer) {
      player.startNextTrack()
    }
  }

  async function makeTrackWithSearch(query) {
    const search = await ytsr(query, {limit: 10})
    for (var i = 0; i < search.items.length; i++) {
      if (search.items[i].type == "video") {
        return await makeTrackWithUrl.youtube(search.items[i].url)
      }
    }
    return
  }

  async function makeTrackWithQuery(query) {
    if (/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(query)) {
      return makeTrackWithUrl.any(query)
    } else {
      return makeTrackWithSearch(query)
    }
  }

  async function skip(guildId, create=false) {
    const player = getPlayer(guildId, create)
    await player.skipCurrentTrack()
  }

  async function shuffle(guildId) {
    const player = getPlayer(guildId)
    await player.shuffleQueue()
  }

  async function joinVoiceChannel(guildId, voiceChannel, create=true, forceJoin=false) {
    const player = getPlayer(guildId, create)
    if (!player) return undefined
    if (!player.connection) await player.join(voiceChannel)
  }
  return {getQueue, makeTrackWithUrl, makeTrackWithQuery, makeTrackWithSearch, addTrack, joinVoiceChannel, skip}
}
