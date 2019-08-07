module.exports = {
	name: 'snap',
	description: 'Balances the universe',
	channelWhitelist: ['384946951168327682'],
	execute(message) {
		const voiceChannel = message.client.channels.get('384946952758099970');
		if (voiceChannel.members.size === 0)
			return;

		const half = (voiceChannel.members.size == 1) ? 1 : Math.floor(voiceChannel.members.size / 2);
		const victims = voiceChannel.members.random(half);

		voiceChannel.join()
			.then(connection => {
				let dispatcher = connection.playFile('./files/snap.mp3', { volume: .2, bitrate: 'auto' });
				dispatcher.on('end', () => {
					voiceChannel.leave();
					for (let victim of victims)
					{
						victim.setVoiceChannel(null).catch();
						message.channel.send(`For the good of the universe ${message.client.emojis.get('445854084851957781')}`, { reply: victim }).catch();
					}
				});
			});

		console.log((new Date().toLocaleString('en-US')) + ': Finally, perfectly balanced.');
	},
};