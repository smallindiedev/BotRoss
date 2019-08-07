module.exports = {
	name: 'help',
	description: 'Lists all commands or information about a given command.',
	aliases: ['commands'],
	execute(message, args) {
		const { commands } = message.client;
		const data = [];

		if (!args.length || !commands.has(args[0]))
		{
			data.push('These are all the currently available commands:');

			let commandList = commands.map(command => command.name);
			data.push(commandList.join(', '));

			data.push('\nUse \'!help <command name>\' for specific information.');
		}
		else
		{
			const command = commands.get(args[0]) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

			data.push(`**Name:** ${command.name}`);

			if (command.description) data.push(`**Description:** ${command.description}`);
			if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
			if (command.usage) data.push(`**Usage:** ${command.usage}`);

			data.push(`**Arguments Required:** ${command.argsRequired ? 'Yes' : 'No'}`);

			if (command.allowedRoles) data.push(`**Allowed Roles:** ${command.allowedRoles.join(', ')}`);

			if (command.globalCooldown) data.push(`**Cooldown (per Channel):** ${command.globalCooldown} seconds`);
			else if (command.userCooldown) data.push(`**Cooldown (per User):** ${command.userCooldown} seconds`);

			if (command.channelWhitelist)
			{
				let channelNames = [];
				for (let channelID in command.channelWhitelist)
				{
					if (message.guild.channels.has(channelID))
					{
						let channel = message.guild.channels.get(channelID);
						channelNames.push(`${channel.parent ? channel.parent.name + ': ' : ''}${channel.name}`);
					}
				}

				data.push(`**Whitelisted Channels:** ${channelNames.join(', ')}`);
			}
			else if (command.channelBlacklist)
			{
				let channelNames = [];
				for (let channelID in command.channelBlacklist)
				{
					if (message.guild.channels.has(channelID))
					{
						let channel = message.guild.channels.get(channelID);
						channelNames.push(`${channel.parent ? channel.parent.name + ': ' : ''}${channel.name}`);
					}
				}

				data.push(`**Blacklisted Channels:** ${channelNames.join(', ')}`);
			}
		}

		message.client.log(`Command info displayed for '${args[0] || 'all commands'}'.`, message, this.name);
		message.channel.send(data, { split: true });
	},
};
