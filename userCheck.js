/**
 * Checks if a user is in a voice channel
 * @param  {Interaction}  interaction Interaction from user in question
 * @return {boolean} If check passed
 */
exports.isInVoice = (interaction) => {
  return interaction.member.voice.channelId
}

/**
 * Checks if a user is in a voice channel with this bot
 * @param  {Interaction}  interaction Interaction from user in question
 * @return {boolean} If check passed
 */
exports.isInVoiceWithBot = (interaction) => {
  return interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
}

/**
 * Checks if a user is in a joinable voice channel
 * @param  {Interaction}  interaction Interaction from user in question
 * @return {boolean} If check passed
 */
exports.isVoiceJoinable = (interaction) => {
  return interaction.member.voice.channel.joinable
}
