# dtune

Minimal audio player for discord bots.

## Why

Because other modules that does the same, either takes way to much control, doesn't support interactions very well or is unstable.

This aims to be minimal, as it wont send messages or do anything else, and lets you do it using events.

# Installation

```sh
npm i dtune
```

# Getting started

## Documentation

The documentation is available at (insert link here)

## Getting started

I reccomend attaching dTune to your discordjs client object. As this makes it easier to access it if you are using command files.

```js
client.dtune = require('./util/dtune');
```

Now you can fetch players using

```js
const player = client.dtune.getPlayer(guildId, create)
// Set create to true to create the player if it doesn't exist
```

To help getting started, and simplify controlling dTune, you can use a dTuneInterface.

```js
client.dtuneInterface = require('./util/dtune/interface.js')(client.dtune);
```

### Examples

#### Using dTuneInterface to join a voice channel and play a video

```js
// Get the track, makeTrackWithQuery will search up the video if it isn't an URL
let track = await client.dtuneInterface.makeTrackWithQuery("rickroll")
// Set the ID of who requested it, not required
track.requesterId = user.id
// Wait for it to join the voice channel. (When already in a channel it doesn't do anything)
await client.dtuneInterface.joinVoiceChannel(interaction.guildId, interaction.member.voice.channel)
// Add the track to the queue
await client.dtuneInterface.addTrack(interaction.guildId, track)
// And you should hear the track playing
```

#### Announce what track is playing

```js
// Register the event
client.dtune.events.on('playingTrack', async (player) => {
    // Get guild data from a database or a variable
    const guild = await client.data.getGuild(player.guildId);
    // Check if the guild has a channel for announcements
    if (guild.announcementChannel) {
      // Fetch the channel
      client.channels.fetch(guild.announcementChannel)
        .then(channel => {
          // Then send an embed with the track
          channel.send({
              embeds: [
                new MessageEmbed()
                .setTitle(`${emoji("dance")} Now playing:`)
                .setDescription(`[${player.queue[0].info.title} - ${player.queue[0].info.lengthFormatted}](${player.queue[0].url})`)
                .setImage(player.queue[0].info.thumbnail)
              ]
            })
            .catch(console.error);
        })
    }
})
```

#### Display the queue on slash command

```js
// This is a command file named queue.js that is loaded by the bot, it only contains the command
// Import libraries
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  // Defining the slash command
	command: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Displays the queued tracks'),

  // The command code
	async execute(interaction) {
    // Fetch the queue, but only elements up until 20
		let {start, stop, length, queue} = await this.client.dtuneInterface.getQueue(interaction.guildId, 0, 20, true)

    // Tell if the queue was empty
		if (length < 1) return interaction.reply({ content: emoji("crash") + " There is no music playing.", ephemeral: true })

    // Start building the message
		let message = ""
		queue.forEach((song, i) => {
			message += (i == 0) ? '[Playing]: ' : '[' + i + ']: '
			message += `[${song.title} - ${song.lengthFormatted}](${song.url})\n`
		});

		const exampleEmbed = new MessageEmbed()
		.setTitle("Queue:")
		.setDescription(message)

    // If there is queued more than 20 elements, tell the user
		if (length > 20) {
			exampleEmbed.setFooter("+ " + (length - 20) + " more")
		}

    // Send the message
		interaction.reply({ embeds: [exampleEmbed], ephemeral: true });
	}
};
```

#### dTune used in a bot

CaptainHook, uses dTune for its music features.
