const { Manager } = require("erela.js")
const EventEmitter = require("events")

class Client extends EventEmitter {
  
  constructor(client, options={}) {
   
    this.voice = options.voiceChannel
    
    this.textChannel = options.textChannel
    
    this.guild = options.guild
    
    this.client = client
    
    this.manager = new Manager({
 nodes: [{
    host: options.host || "lavalink.something.host",
   port: options.port || 80,
   password: options.password || "youshallnotpass"
  }],
  autoPlay: true,
  send: (id, payload) => {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  }
});
    
  
  
 this.manager.on("nodeConnect", node => {
    this.emit("ready", `Node connected`)
  this.emit("debug", `Fetch Node Information
  ${node.identifier.options}`)
   
   this.emit("debug", `Default Options
     Host: lavalink.something.host
    Port: 80
    Password: youshallnotpass`)
   
})

 this.manager.on("nodeDestroy", node => {
   this.emit("destroy", `Node destroyed`)
 })
  
this.manager.on("nodeReconnect", node => {
  this.emit("reconnect", `Node reconnecting`)
});
    
this.manager.on("nodeError", (node, error) => {
    this.emit("error", error.message)
})

this.client.on("raw", d => this.client.manager.updateVoiceState(d));

this.manager.on("trackStart", (player, track) => {
  this.emit("debug", `Fetch Player information
  Status: Track Started
  Name: ${track.title}
  `)
  const channel = client.channels.cache.get(player.textChannel);
channel.send(`**🎶Now Playing ${track.title}**`)
});

this.manager.on("trackStuck", (player) => {
  this.emit("debug", `Fetch player information
  Status: Track Stuck`)
  player.destroy()
})
    
    
this.client.manager.on("queueEnd", player => {
  this.emit("debug", `Fetch player information
  Status: Queue Ended`)
  
  player.destroy()
})
    
this.client.on("ready", () => {
  this.manager.init(this.client.user.id);
  })
  }
  async join() {
  
    this.client.channels.cache.get(this.voice).join()
    
  }
  
  async play(song, author) {
    
    const voice = this.voice

  
    const search = song
    let res;

    try {
      res = await this.manager.search(search, author);
    
      if (res.loadType === "LOAD_FAILED") return this.client.channels.cache.get(this.textChannel).send("Could not load playlist")
      else if (res.loadType === "PLAYLIST_LOADED") return this.client.channels.cache.get(this.textChannel).send("Playlists are not supported with this command")
    } catch (err) {
      return this.client.channels.cache.get(this.textChannel).send("Try again later")
    }

   
    this.player = this.manager.create({
      guild: this.guild,
      voiceChannel: this.voice,
      textChannel: this.textChannel,
    });
  
    
    this.player.connect();
    this.player.queue.add(res.tracks[0]);
  
  
    if (!this.player.playing && !this.player.paused && !this.player.queue.length) this.player.play()

      
    
}
  
  async destroy() {
    
    this.player.destroy()
  }
  
  async skip() {
    
    this.player.stop()
  }
  async np() {
    
    const player = this.manager.get(this.guild.id)
    
    const queue = player.queue
    
    return this.client.channels.cache.get(this.textChannel).send(queue.current.title)
    
  }
  
  async volume(volume) {
    
    let vol = Number(volume)
    
    this.player.setVolume(vol)
  }
  
  async pause() {
  
  this.player.pause(true)
  }
  
  async resume() {
    
    this.player.pause(false)
  }
  
  
  async queue(args) {
    
  
    
     const player = this.manager.get(this.guild.id);
    if (!player) return this.client.channels.cache.get(this.textChannel).send("There is nothing playing");

    const queue = player.queue;
    const multiple = 10;
   const page = args.length && Number(args[0]) ? Number(args[0]) : 1;

    
    
    const end = page * multiple;
    const start = end - multiple;

    const tracks = queue.slice(start, end);

  return this.client.channels.cache.get(this.textChannel).send({embed: { color: "RANDOM", description: `${tracks.map((track, i) => start + (++i) - [track.title](track.uri)).join("\n")}`}});
    
  }
  
  
  async bassboost() {
    
    const levels = {
  none: 0.0,
  low: 0.10,
  medium: 0.15,
  high: 0.25,
};
    const level = "none"
    const bands = new Array(3)
      .fill(null)
      .map((_, i) =>
        ({ band: i, gain: levels[level] })
      );

    this.player.setEQ(...bands);
    
  }
  
  async repeat(args) {
    
    if (args.length && /queue/i.test(args[0])) {
      this.player.setQueueRepeat(!this.player.queueRepeat);
      const queueRepeat = this.player.queueRepeat ? "enabled" : "disabled";
      return this.client.channels.cache.get(this.textChannel).send(`Queue repeat ${queueRepeat}`);
    }

    this.player.setTrackRepeat(!this.player.trackRepeat);
    const trackRepeat = this.player.trackRepeat ? "enabled" : "disabled";
    return this.client.channels.cache.get(this.textChannel).send(`Track repeat ${trackRepeat}`);
    
  }
  
}

module.exports = Client