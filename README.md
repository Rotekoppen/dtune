# dtune

Minimal audio player for discord bots, not a discord bot.

## Why

Because other modules that does the same, either takes way to much control, doesn't support interactions very well or is unstable.

This aims to be minimal, as it wont send messages or do anything else, and lets you do it using events.

Most features outside playing like searching and checking user and voice channel things are placed in "trackCreator.js" and "userCheck.js" respectivly.

# Features

 - Minimal
 - Queue
 - Preloading for smoother playback
 - Short, (you can read the entire source code under 5 minutes)
 - Almost discordjs independant, requires only a voiceChannel object to join

# Installation

```sh
npm i dtune
```

# Getting started

## Documentation

The documentation is available [here](https://rotekoppen.github.io/dtune/)

## Getting started

I reccomend attaching dTune to your discordjs client object. As this makes it easier to access it if you are using command files.

```js
client.dtune = require('dtune');
```

Now you can fetch players using

```js
const player = client.dtune.getPlayer(guildId, create)
// Set create to true to create the player if it doesn't exist
```

### Used in a bot

[arpeggio-bot](https://github.com/Rotekoppen/arpeggio-bot)

## Licences and such

Currently ive set the license to UNLICENCED for now until I find a fitting license
