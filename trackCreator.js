const play = require('play-dl')

const Track = require('./tracks/track');
const YoutubeTrack = require('./tracks/youtubeTrack');
const YoutubePlaylistTrack = require('./tracks/youtubePlaylistTrack');

/**
 * Creates a track from an URL
 * @param  {String} url
 * @return {Promise<Track>}
 */
exports.createTrack = async (url) => {
  return new Track(url)
}

/**
 * Creates a YoutubeTrack from an URL
 * @param  {String} url
 * @return {Promise<YoutubeTrack>}
 */
exports.createYoutubeTrack = async (url) => {
  const ytMetadata = await play.video_info(url)
  return new YoutubeTrack(url, ytMetadata)
}

/**
 * Creates an array with YoutubePlaylistTracks from an URL
 * @param  {String} url
 * @return {Promise<YoutubePlaylistTrack[]>}
 */
exports.createYoutubePlaylistTrack = async (url) => {
  const playlist = await play.playlist_info(url, { incomplete : true })
  const videos = []
  playlist.videos.forEach((video) => {
    videos.push(new YoutubePlaylistTrack(video.url, video))
  });
  return videos
}

/**
 * Creates a YoutubeTrack using a search Query
 * @param  {String} query - The search query
 * @return {Promise<YoutubeTrack>}
 */
exports.createTrackWithSearch = async (query) => {
  // TODO: If search is broken, try to increase this
  const search = await play.search(query, { source: { youtube: "video" }, limit: 1 })
  return await exports.createYoutubeTrack(search[0].url)
}

/**
 * Creates a track using a query, tries to find the right type, if not a link, searches for it
 * @param  {String}  query - Either a url or a search
 * @return {Promise<Track|YoutubeTrack|YoutubePlaylistTrack[]>}
 */
exports.createTrackWithQuery = async (query) => {
  switch (await play.validate(query)) {
    case 'yt_video':
      return exports.createYoutubeTrack(query)
    case 'yt_playlist':
      return exports.createYoutubePlaylistTrack(query)
    default:
      // TODO: When pure tracks are cool try this
      if (false) { //(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(query)) {
        return exports.createTrack(query)
      } else {
        return exports.createTrackWithSearch(query)
      }
  }
}
