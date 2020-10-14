const { MessageEmbed } = require("discord.js")

const ms = require("ms")


const { Util } = require("discord.js");
const { QUEUE_LIMIT, COLOR } = require("../config.json");
const ytdl = require("ytdl-core");
const YoutubeAPI = require("simple-youtube-api");
const youtube = new YoutubeAPI(this.key);
const { play } = require("../system/music.js");


  
class Client {
  
  async join(message) {
  
  await message.member.voice.channel.join()
    return message.channel.send("Successfully joined")

}

  async play(message, songx) {
    
    const embed = new MessageEmbed()
    .setColor(COLOR)
    
    if (!songx) {
      //IF AUTHOR DIDENT GIVE URL OR NAME
      embed.setTitle("ERROR 404")
      embed.setDescription("**Please give a song name or url")
      return message.channel.send(embed);
    }

    const { channel } = message.voice
        
    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.setTitle("ERROR 404")
      embed.setDescription("**You need to join the voice channel first**")
      return message.channel.send(embed);
    }

    //WE WILL ADD PERMS ERROR LATER :(

    const targetsong = songx
    const videoPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const urlcheck = videoPattern.test(songx);

    if (!videoPattern.test(songx) && playlistPattern.test(songx)) {
      embed.setTitle("ERROR 404")
      embed.setAuthor("I am Unable To Play Playlist for now")
      return message.channel.send(embed);
    }

    const serverQueue = this.queue.get(message.guild.id);

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: 100,
      playing: true
    };
    
    const voteConstruct = {
      vote: 0,
      voters: []
    }

    let songData = null;
    let song = null;

    if (urlcheck) {
      try {
        songData = await ytdl.getInfo(songx);
      
        song = {
             title: songData.videoDetails.title,
          url: songData.videoDetails.video_url,
          duration: songData.videoDetails.lengthSeconds,
          thumbnail: songData.videoDetails.thumbnail.thumbnails[3].url
        };
      } catch (error) {
        if (message.include === "copyright") {
          return message.channel
            .send("**This video content copyright strike i can't play the song**")
            .catch(console.error);
        } else {
          console.error(error);
        }
      }
    } else {
          
      try {
        const result = await youtube.searchVideos(targetsong, 1);
        songData = await ytdl.getInfo(result[0].url);
      
        song = {
          title: songData.videoDetails.title,
          url: songData.videoDetails.video_url,
          duration: songData.videoDetails.lengthSeconds,
          thumbnail: songData.videoDetails.thumbnail.thumbnails[3].url,
        };
      } catch (error) {
        console.log(error)
        if(error.errors[0].domain === "usageLimits") {
          return message.channel.send("**Your YT API limit is over**")
        }
      }
    }

    if (serverQueue) {
        if(serverQueue.songs.length > Math.floor(QUEUE_LIMIT - 1) && QUEUE_LIMIT !== 0) {
      return message.channel.send(`You can not add songs more than ${QUEUE_LIMIT} in queue`)
    }
      
    
      serverQueue.songs.push(song);
      embed.setTitle("Added New Song To Queue")//, client.user.displayAvatarURL())
      embed.setDescription(`**🎶Song added to queue ${song.title}**`)
      embed.setThumbnail(song.thumbnail)
      .setFooter("Likes - " + songData.videoDetails.likes + ", Dislikes - " +  songData.videoDetails.dislikes)
      
      return serverQueue.textChannel
        .send(embed)
        .catch(console.error);
    } else {
      queueConstruct.songs.push(song);
    }

    if (!serverQueue)
      this.queue.set(message.guild.id, queueConstruct);
       this.vote.set(message.guild.id, voteConstruct);
    if (!serverQueue) {
      try {
        queueConstruct.connection = await channel.join();
        play(queueConstruct.songs[0], message);
      } catch (error) {
        console.error(`Could not join voice channel: ${error}`);
        this.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel
          .send({
            embed: {
              title: "ERROR 404",
              description: `Could not join the channel: ${error}`,
              color: "#ff2050"
            }
          })
          .catch(console.error);
      }
    }
    
  }
  
  async drop(message, number) {
    
    const embed = new MessageEmbed()
    .setColor(COLOR)
    
    const serverQueue = this.queue.get(message.guild.id)
    
    const { channel } = message.member.voice.channel
    
    if(!channel) return message.channel.send("You need to join the voice channel first")
    
    if (!serverQueue) {
      embed.setTitle("ERROR 404")
      embed.setDescription("The Queue is empty");
      return message.channel.send(embed);
    }
    
     if(isNaN(number)) {
      embed.setDescription("Please Use Numerical Values Only")
      return message.channel.send(embed)
    }
   
    if(number > serverQueue.songs.length) {
      embed.setTitle("ERROR 404")
      embed.setDescription("Unable to find this song")
      return message.channel.send(embed)
    }
    
    
    serverQueue.songs.splice(number - 1, 1)
    embed.setTitle("ERROR 404")
    embed.setDescription("Droped the song from queue")
  //  embed.setThumbnail(client.user.displayAvatarURL())
    return message.channel.send(embed)
    
  }
  
  async jump(message, number) {
    
    let embed = new MessageEmbed()
    .setColor(COLOR)
    
    const { channel } = message.member.voice.channel
    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.setTitle("ERROR 404")
      embed.setDescription("**You need to join the voice channel first**")
      return message.channel.send(embed);
    }

    const serverQueue = this.queue.get(message.guild.id);

    if (!serverQueue) {
      embed.setTitle("ERROR 404")
      embed.setDescription("**There is nothing playing that i could loop**")
      return message.channel.send(embed);
    }
     if(!number) {
       embed.setTitle("ERROR 404")
      embed.setDescription(`**Please Give The Song Number**`)
      return message.channel.send(embed)
    }
    
      if(isNaN(number)) {
        embed.setTitle("ERROR 404")
      embed.setDescription("**Please Use Numerical Values Only**")
      return message.channel.send(embed)
    }
    
    
    //LETS FIX JUMP COMMAND :D
  if(serverQueue.songs.length < number) {
    embed.setTitle ("ERROR 404")
    embed.setDescription("**Unable To Find This Song in Queue**")
    return message.channel.send(embed)  
                                         }
    serverQueue.songs.splice(0, Math.floor(parseInt(number) - 1))
    serverQueue.connection.dispatcher.end()
    
    embed.setTitle("Jumped")
    embed.setDescription(`**Jumped to the song number ${number}**`)
    message.channel.send(embed)
    
    
  }
  
  async loop(message) {
    
    let embed = new MessageEmbed()
.setColor(COLOR);

    const { channel } = message.member.voice.channel
    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.Description("**You need to join the voice channel first**")
      return message.channel.send(embed);
    }

    const serverQueue = this.queue.get(message.guild.id);

    if (!serverQueue) {
      embed.setTitle("ERROR 404")
      embed.setDescription("**There is nothing playing that i could loop**")
      return message.channel.send(embed);
    }
    
    //OOOOF
    serverQueue.loop = !serverQueue.loop
    
    
    embed.setDescription(`Loop is now **${serverQueue.loop ? "Enabled" : "Disabled"}**`)
   // embed.setThumbnail(client.user.displayAvatarURL())
   message.channel.send(embed)
    
  }
  
  async lyrics(message, song) {
    
    const Genius = new (require("genius-lyrics")).Client("ZD_lLHBwRlRRfQvVLAnHKHksDHQv9W1wm1ZAByPaYo1o2NuAw6v9USBUI1vEssjq")
    
    let embed = new MessageEmbed()
    .setDescription("Looking For Lyrics ...")
    .setColor("YELLOW")
    
    if(!song) {
      return message.channel.send("Please Give The Song Name")
    }
    
    const msg = await message.channel.send(embed)
     try {
          const songs = await Genius.tracks.search(song);
          const lyrics = await songs[0].lyrics();
          
           if (lyrics.length > 4095) {
             msg.delete()
        return message.channel.send('Lyrics are too long to be returned as embed');
     }
      if (lyrics.length < 2048) {
        const lyricsEmbed = new MessageEmbed()
          .setColor(COLOR)
          .setDescription(lyrics.trim());
        return msg.edit(lyricsEmbed);
      } else {
        // lyrics.length > 2048
        const firstLyricsEmbed = new MessageEmbed()
          .setColor(COLOR)
          .setDescription(lyrics.slice(0, 2048));
        const secondLyricsEmbed = new MessageEmbed()
          .setColor(COLOR)
          .setDescription(lyrics.slice(2048, lyrics.length));
        msg.edit(firstLyricsEmbed);
        message.channel.send(secondLyricsEmbed);
        return;
      }
      
       
     } catch(e) {
       embed.setTitle("ERROR 404")
       embed.setDescription("**Try again later**")
       msg.edit(embed)
          console.log(e);
     }
    
  }
  
  async np(message) {
    
    
    let embed = new MessageEmbed()
    .setColor(COLOR)
    
    const { channel } = message.member.voice.channel
    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.setTitle ("ERROR 404")
      embed.setDescription("**You need to join the voice channel first**")
      return message.channel.send(embed);
    }

    const serverQueue = this.queue.get(message.guild.id);

    if (!serverQueue) {
      embed.setTitle("ERROR 404")
      embed.setADescription("**Bot is not playing anything**")
      return message.channel.send(embed);
    }
    
    embed.setDescription(`**NOW PLAYING** - ${serverQueue.songs[0].title}`)
    .setThumbnail(serverQueue.songs[0].thumbnail)
    message.channel.send(embed)

    
  }
  
  async pause(message) {
    
    const { channel } = message.member.voice.channel
   let embed = new MessageEmbed()
.setColor(COLOR);

    
    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.setTitle("ERROR 404")
      embed.setDescription("**You need to join the voice channel first**")
      return message.channel.send(embed);
    }
    
    
    const serverQueue = this.queue.get(message.guild.id);

    if (!serverQueue) {
      embed.setTitle ("ERROR 404")
      embed.setDescription("**There is nothing playing that i could pause**")
      return message.channel.send(embed);
    }
    
    if(serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause(true)
      
      embed.setDescription("Paused The Current Playing Song")
     // embed.setThumbnail(client.user.displayAvatarURL())
      return message.channel.send(embed)
  }  
    
  }
  
  async queue(message) {
    let embed = new MessageEmbed()
    .setColor(COLOR);
    const { channel } = message.member.voice.channel

    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.setTitle("ERROR 404")
      embed.setAuthor("**You need to join the voice channel first**");
      return message.channel.send(embed);
    }

    const serverQueue = this.queue.get(message.guild.id);

    if (!serverQueue) 
      embed.setTitle("ERROR 404")
      embed.setDescription("**There is nothing in the queue**");
      return message.channel.send(embed);
  

    embed.setDescription(
      `${serverQueue.songs
        .map((song, index) => index + 1 + ". " + song.title)
        .join("\n\n")}`,
      { split: true }
    );
   // embed.setThumbnail(client.user.displayAvatarURL())
    
    message.channel.send(embed);
    
  }
  
  async resume(message) {
    let embed = new MessageEmbed()
.setColor(COLOR);

      const { channel } = message.member.voice.channel
    
    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.setTitle("ERROR 404")
      embed.setAuthor("**You need to join the voice channel first**")
      return message.channel.send(embed);
    }

    const serverQueue = this.queue.get(message.guild.id);
 if(serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume()
  embed.setDescription("Resumed the Paused Song")
  // embed.setThumbnail(client.user.displayAvatarURL())
  return message.channel.send(embed)
 }
    embed.setTitle("ERROR 404")
    embed.setDescription("**There is nothing paused that i can resume**")
    message.channel.send(embed)
  }
  
  async skip(message) {
    
    let embed = new MessageEmbed()
.setColor(COLOR);


    const { channel } = message.member.voice.channel

       
    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.setTitle("ERROR 404")
      embed.setDescription("**You need to join the voice channel first**")
      return message.channel.send(embed);
    }
    const serverQueue = this.queue.get(message.guild.id);
const vote = this.vote.get(message.guild.id)
    if (!serverQueue) {
      embed.setTitle("ERROR 404")
      embed.setDescription("**There is nothing playing that i could skip**")
      return message.channel.send(embed);
    }
    
    const vcvote = Math.floor(message.guild.me.voice.channel.members.size / 2)
    const okie = Math.floor(message.guild.me.voice.channel.members.size / 2 - 1)
    console.log(message.guild.me.voice.channel.members.size)
     if(!message.member.hasPermission("ADMINISTRATOR")) {
       if(vote.vote > okie) {
         serverQueue.connection.dispatcher.end();
    embed.setDescription("VOTE - SKIP | Skipping The Song")
   // embed.setThumbnail(client.user.displayAvatarURL())
    return message.channel.send(embed);
       }
       
       if(vote.voters.includes(message.author.id)) {
         return message.channel.send("You already voted for this song")
       }
       
       if(vcvote === 2) {
          serverQueue.connection.dispatcher.end();
    embed.setDescription(" Skipping The Song")
    //embed.setThumbnail(client.user.displayAvatarURL())
    return message.channel.send(embed);
       }
       
       
       
vote.vote++
       vote.voters.push(message.author.id)
       return message.channel.send(`You Voted for the Song to Skip, btw we currently need ${Math.floor(vcvote - vote.vote)} votes`)
    
     
     
     
     }

    serverQueue.connection.dispatcher.end();
    embed.setDescription("Skipping The Song")
  //  embed.setThumbnail(client.user.displayAvatarURL())
    message.channel.send(embed);
    
  }
  
  
  async stop(message) {
    
    let embed = new MessageEmbed()
    .setColor(COLOR)
    
    const { channel } = message.member.voice.channel
      
    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.setDescription("**You need to join the voice channel first**")
      return message.channel.send(embed);
    }

    const serverQueue = this.queue.get(message.guild.id);

    if (!serverQueue) {
      embed.setTitle ("ERROR 404")
      embed.setDescription("**There is nothing playing that i could stop*(")
      return message.channel.send(embed);
    }

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    
  }
  
  async volume(message, volume) {
    
    let embed = new MessageEmbed()
    .setColor(COLOR);

    
    const { channel } = message.member.voice.channel
    if (!channel) {
      //IF AUTHOR IS NOT IN VOICE CHANNEL
      embed.setTitle("ERROR 404")
      embed.setDescription("**You need to join the voice channel first**")
      return message.channel.send(embed);
    }
    
     const serverQueue = this.queue.get(message.guild.id);

    if (!serverQueue) {
      embed.setTitle("ERROR 404")
      embed.setDescription("**Bot is not playing anything**")
      return message.channel.send(embed);
    }
    
    if(!volume) {
      embed.setDescription(`The Current Volume is ${serverQueue.volume}`)
      return message.channel.send(embed)
    }
    
    if(isNaN(volume)) {
      embed.setTitle("ERROR 404")
      embed.setDescription("Please Use Numerical Values Only")
      return message.channel.send(embed)
    }
    
    if(volume > 200) {
      embed.setAuthor("You will die if you reach the limit of 200 :)")
      return message.channel.send(embed)
    }
    
    serverQueue.volume = volume
    serverQueue.connection.dispatcher.setVolumeLogarithmic(volume / 100)
    embed.setDescription(`Seted Volume to ${volume}`)
    //embed.setThumbnail(client.user.displayAvatarURL())
    message.channel.send(embed)
    
  }
  
}

module.exports = Client