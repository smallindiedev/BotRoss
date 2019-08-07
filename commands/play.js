const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const Discord = require('discord.js');

module.exports = {
	name: 'play',
	description: 'Plays audio from a youtube link or ID in the sender\'s voice channel.\nAlternatively, searches for the first result based on provided search terms.',
	aliases: ['song', 'playsong'],
	argsRequired: true,
	usage: '<youtube link (full link or video ID)>\n!play search <search terms>',
	//allowedRoles: [],
	//additional properties,
	execute(message, args) {
		if (!message.member.voiceChannel)
		{
			message.reply('You must be in a voice channel to use this command.');
			console.log((new Date().toLocaleString('en-US')) + `: Command attempted while not in a voice channel. ('${this.name}' by ${message.author.username})`);
			return;
		}
		if (message.client.voiceConnections.has(message.guild.id))
		{
			let voiceCh = message.client.voiceConnections.get(message.guild.id).channel;
			if (voiceCh.connection.dispatcher)
				voiceCh.connection.dispatcher.end();
			voiceCh.leave();
			console.log((new Date().toLocaleString('en-US')) + `: Left the ${voiceCh.name} voice channel of ${voiceCh.guild.name} due to new command activation. ('${this.name}' by ${message.author.username})`);
		}


		if (args[0] == 'search' && args.length > 1)
		{
			args.shift();
			const searchTerm = args.join(' ');
			ytSearch(searchTerm, (err, r) => {
				if (err) return console.log(err);
				const ytLink = r.videos[0].videoId;
				this.playAudio(message, ytLink);
			});
		}
		else if (ytdl.validateURL(args[0]) || ytdl.validateID(args[0]))
		{
			const ytLink = ytdl.getVideoID(args[0]);
			this.playAudio(message, ytLink);
		}
		else
		{
			message.reply('Please specify a valid youtube link or video ID with this command [!help for more details].');
			console.log((new Date().toLocaleString('en-US')) + `: Command activated with invalid arguments. ('${this.name}' by ${message.author.username})`);
		}
	},

	async testSpeaking(connection, message, ytLink) {
		if (connection.speaking)
		{
			let id = ytLink;
			ytLink = `https://youtube.com/watch?v=${ytLink}`;
			ytdl.getInfo(ytLink).then(info => {
				const linkEmbed = new Discord.RichEmbed()
					.setAuthor(`Requested by ${message.author.username}`)
					.setTitle(info.title)
					.setURL(ytLink)
					.setFooter(`ID: ${id}`)
					.setTimestamp();
				message.channel.send(linkEmbed).catch();
				console.log((new Date().toLocaleString('en-US')) + `: Returning video ID and deleting message. ('${this.name}' by ${message.author.username})`);
				message.delete();
			}).catch();
		}
		else
		{
			console.log((new Date().toLocaleString('en-US')) + `: Audio not detected upon testing. Leaving voice channel. ('${this.name}' by ${message.author.username})`);
			connection.disconnect();
		}
	},

	playAudio(message, ytLink) {
		let voiceCh = message.member.voiceChannel;

		if (!voiceCh)
		{
			console.log((new Date().toLocaleString('en-US')) + `: Command attempted with no valid voice channels in server. ('${this.name}' by ${message.author.username})`);
			message.reply('No applicable voice channel was found.');
			return;
		}

		let streamOptions = { volume: .2 };


		voiceCh.join()
			.then(connection => {
				console.log((new Date().toLocaleString('en-US')) + `: Successfully connected to the ${voiceCh.name} voice channel of ${voiceCh.guild.name}. ('${this.name}' by ${message.author.username})`);
				const stream = ytdl(ytLink, { filter: 'audioonly' });
				let dispatcher = connection.playStream(stream, streamOptions);
				console.log((new Date().toLocaleString('en-US')) + `: Now playing audio in the ${voiceCh.name} voice channel of ${voiceCh.guild.name}. ('${this.name}' by ${message.author.username})`);
				dispatcher.on('end', () => {
					voiceCh.connection.disconnect();
				});
			})
			.then(() => {
				setTimeout(this.testSpeaking, 10000, voiceCh.connection, message, ytLink);
				console.log((new Date().toLocaleString('en-US')) + `: Verifying whether audio is playing. ('${this.name}' by ${message.author.username})`);
			})
			.catch(console.error);
		if (!voiceCh.connection)
		{
			console.log((new Date().toLocaleString('en-US')) + `: Command failed at voice channel connection. ('${this.name}' by ${message.author.username})`);
			message.reply('Failed to join the appropriate voice channel.');
			return;
		}

		voiceCh.connection.on('disconnect', () => {
			console.log((new Date().toLocaleString('en-US')) + `: Left the ${voiceCh.name} voice channel of ${voiceCh.guild.name}. ('${this.name}' by ${message.author.username})`);
		});
	}
};