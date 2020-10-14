# Lavaplayer

#### A very high quality music package give best quality music

# Requirements

**Discord.js v12 or higher**

**Node v12**

# Disclaimer 

**Message is a object of every funcition so message is required**

# Install

`npm i lavaplayer`

# Example

```js

const bot = require("lavaplayer") // required module
const Discord = require("discord.js")
const client = new Discord.Client()
const music = new bot.Client("yt-api-key")

client.on("message", async message => {

if(message.content === "!play") {
music.play(message, "Im on my way") // bot join the voice channel and play song 
}

client.login("token")
```

# Futures

**Best quality music**

**Arguments are already customized**

**Easy methods**

**No rate limit**

# Documantion

| Methods       | Type           | Description |
| ------------- |:-------------:|:--------------:|
| play(message, song)     | Object & String | Play a song |
| pause(message)      | Object | Pause the current song |
| resume(message) | Object | Resume the pause song |
| volume(message, volume) | Object & String | Set the volume of songs |
| skip(message) | Object | Skip a song |
| stop(message) | Object | Stop all songs |
| join(message) | Object | Join a voice channel |
| queue(message) | Object | View queue songs|
| np(message) | Object| See now playing song |
| drop(message, number) | Object & String | Drop a song from queue |
| jump(message, number) | Object & String | Jump to a song |
| loop(message) | Object | Loop the songs |
| lyrics(message, song) | Object & String| Get the lyrics of song |

# Support

**If you have bug or issues report here [Github](https://github.com/RPGTheGreat/lavaplayer)**

**If you need to support join our support server [Discord](https://discord.gg/yqAGXbz)**
