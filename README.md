# Lavaplayer

**A very high quality music package give best quality music**

# Requirements

**Discord.js v12 or higher**

**Node v12**

# Note

**This package only for discord.js not for eris and other library's**

# Install

`npm i lavaplayer`

# Example

```js

const bot = require("lavaplayer") // required module
const Discord = require("discord.js") //required module
const client = new Discord.Client()


client.on("message", async message => {

const music = new bot.Client(client, {
  guild: message.guild.id, //the guild where players connect
  textChannel: message.channel.id, //the channel where player messages send
  voiceChannel: message.member.voice.channel.id, //the channel that where player join and connect
  host: "localhost", //default is lavalink.something.host
  port: 80, //default port 80
  password: "youshallnotpass" //default password youshallnotpass
})
  
if(message.content === "!play") {
 music.play("Im on my way", message.author) // bot join the voice channel and play song 
  return message.channel.send("Im now playing I'm on my way")
}
});
client.login("token")
```

# Features

- Best quality music

- Arguments are already customized or non-customized

- Easy methods

 - No rate limit
 
 - No api key required

# Functions

| Methods       | Type           | Description |
| ------------- |:-------------:|:--------------:|
| play(song, author)     | String | Play a track |
| pause()      | Function | Pause the current track |
| resume() | Function | Resume the pause track |
| volume(volume) | Function | Set the volume of tracks |
| skip() | Function | Skip a track |
| destroy() | Function | Stop all tracks |
| join() | Function | Join a voice channel |
| queue(args) | Function | View queue tracks | 
| np() | Function | See now playing track |
| repeat() | Function | Repeat queue or track |
| bassboost() | Function | Bassboost tracks |

# Events

`error` - Emit error when player get error

`debug` - Emit debugging

`ready` - Emit ready whenever player is ready

`reconnect` - Emit reconnect when player try to reconnect

`destroy` - Emit destroy when player get destroyed

# Links

- [Github](https://github.com/RPGTheGreat/lavaplayer)

- [Discord](https://discord.gg/yqAGXbz)
