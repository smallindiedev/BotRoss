//Config file settings
//REQUIRED: Token is the login token of the account
//OPTIONAL: Prefix is how you want to precede commands name, i.e !help. Defaults to '!'
//OPTIONAL: Admin is an array of User ID strings. Admins bypass any limits set on commands.
//OPTIONAL: MessageTracking is the ID of a Channel that the bot uses to report message edits and deletes.

const { token, prefix, admin, messageTracking } = require('./config.json');
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
client.commands = new Discord.Collection();

//See cooldown implementation for details.
const userCooldowns = new Discord.Collection();
const globalCooldowns = new Discord.Collection();

//A logging function that prepends timestamps to log messages.
//Optional msg appends the username of the message author.
//Optional cmdName appends where the log call initiated.
client.log = function (text, msg, cmdName) {
	let fullLog = `${(new Date()).toLocaleString('en-US')}: ${text}`;

	if (msg) fullLog += ` | ${msg.author.tag}`;

	if (cmdName) fullLog += ` | ${cmdName}`;

	console.log(fullLog);
};

//Any initialization goes here. The ready event is emitted when the bot first connects.
client.on('ready', () => {
	client.log('Bot is now running.');

	//Sets the client's activity in the user list.
	client.user.setActivity('Everything', { type: 'LISTENING' });

	//Load all commands in the command folder, skipping the template file.
	for (const file of fs.readdirSync('./commands'))
	{
		if (file !== 'template.js')
		{
			const command = require(`./commands/${file}`);
			client.commands.set(command.name.toLowerCase(), command);
		}
	}
});

//The message event is emitted whenever a message from ANY user is received.
client.on('message', message => {
	//Ignore messages from any bot accounts, including this one.
	if (message.author.bot) return;

	//Ignores messages that do not start with the given prefix. (default '!')
	//Respond to any message in general above this point.
	if (!message.content.startsWith(prefix)) return;

	//Parses the message into arguments and retrieves the [potential] command name.
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	//Attempts to find the command by name or alias, returning if it does not exist.
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return message.reply(`${commandName} is not a valid command. Use !help for a list of all commands.`);

	client.log(`Call made to command '${command.name}. Checking permissions.'`, message);

	//Quick check for the ArgsRequired property.
	if (command.argsRequired && args.length === 0)
	{
		message.reply(`The command ${command.name} requires arguments to be supplied. `
			+ `See \`!help ${command.name} for details.\``);
		return;
	}

	//Permission checks and cooldown management happen in this block.
	//User IDs designated as admin in the config file bypass these rules.
	if (!admin.includes(message.author.id))
	{
		//Checks to see if the command is admin only.
		if (command.adminOnly)
		{
			message.reply(`The command ${command.name} is designated admin only.`);
			return;
		}

		//Checks to see if the command is allowed by the channel blacklist or whitelist settings
		if (command.channelWhitelist && !command.channelWhitelist.includes(message.channel.id))
		{
			message.reply(`The command ${command.name} is not allowed in this channel. [Whitelist]`);
			return;
		}
		else if (command.channelBlacklist && command.channelBlacklist.includes(message.channel.id))
		{
			message.reply(`The command ${command.name} is not allowed in this channel. [Blacklist]`);
			return;
		}

		//Checks to see if the user has the required role to use the command.
		if (command.allowedRoles && !message.author.roles.some(role => command.allowedRoles.includes(role)))
		{
			message.reply(`The command ${command.name} requires one of the following roles: `
				+ `[${command.allowedRoles.join(', ')}]`);
			return;
		}

		//Cooldown Management

		//GLOBAL COOLDOWNS
		//Cooldowns are stored in a collection with a timestamp for when the command was called.
		//A timeout removes this record once the specified cooldown time has passed.
		//If the command is called again before the timeout takes effect, the remaining time is displayed instead.
		if (command.globalCooldown)
		{
			const now = Date.now();
			const cooldownAmount = command.globalCooldown * 1000;

			if (globalCooldowns.has(command.name))
			{
				const cooldownExpiration = globalCooldowns.get(command.name) + cooldownAmount;

				if (now < cooldownExpiration)
				{
					const timeLeft = (cooldownExpiration - now) / 1000;

					//Comment out the below message.reply to eliminate spam from the remaining time messages.
					message.reply(`The command ${command.name} cannot be used for `
						+ `${timeLeft.toFixed(1)} more seconds.`);

					return;
				}
			}

			globalCooldowns.set(command.name, now);
			setTimeout(() => globalCooldowns.delete(command.name), cooldownAmount);
		}
		//USER COOLDOWNS
		//User cooldowns are tracked with the same general logic as global cooldowns.
		//The key difference is each command is mapped to its own collection tracking timestamps
		//for individual users, as opposed to a single timestamp for the command.
		else if (command.userCooldown)
		{
			if (!userCooldowns.has(command.name))
			{
				userCooldowns.set(command.name, new Discord.Collection());
			}

			const now = Date.now();
			const timestamps = userCooldowns.get(command.name);
			const cooldownAmount = command.userCooldown * 1000;

			if (timestamps.has(message.author.id))
			{
				const cooldownExpiration = timestamps.get(message.author.id) + cooldownAmount;

				if (now < cooldownExpiration)
				{
					const timeLeft = (cooldownExpiration - now) / 1000;

					//Comment out the below message.reply to eliminate spam from the remaining time messages.
					message.reply(`You cannot use the command ${command.name} for `
						+ `${timeLeft.toFixed(1)} more seconds.`);

					return;
				}
			}

			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		}
	}

	//Command Execution
	try
	{
		client.log('Command execution beginning.', message, command.name);
		command.execute(message, args);
	}
	catch (error)
	{
		console.error(error);
	}
});

//Generic error logging
client.on('disconnect', () => client.log('The bot has disconnected.'));
client.on('reconnecting', () => client.log('The bot is reconnecting.'));
client.on('error', () => client.log('Something awful happened.'));
client.on('warn', () => client.log('Something awful could have happened.'));

//Logs message edits to the MessageTracking channel, if supplied in config file.
client.on('messageUpdate', (oldMessage, newMessage) => {
	if (messageTracking === '0') return;
	if (newMessage.author.bot || (oldMessage.content === newMessage.content)) return;

	if (!client.channels.has(messageTracking))
	{
		client.log('Invalid ChannelID supplied for message tracking', null, 'MessageTracking-Edit');
		return;
	}

	let trackingChannel = client.channels.get(messageTracking);

	trackingChannel.send(`\`${(new Date().toLocaleString('en-US'))}: `
		+ `${oldMessage.author.username}#${oldMessage.author.tag} edited a message in `
		+ `${oldMessage.guild.name}:${oldMessage.channel.name}\``);

	trackingChannel.send(`\`Old message:\`\n${oldMessage.content}`);
	trackingChannel.send(`\`New message:\`\n${newMessage.content}`);

	trackingChannel.send('`---------------------------------------------------------------------------------`');
});

//Logs message deletes to the MessageTracking channel, if supplied in config file.
client.on('messageDelete', message => {
	if (messageTracking === '0') return;
	if (message.author.bot) return;

	if (!client.channels.has(messageTracking))
	{
		client.log('Invalid ChannelID supplied for message tracking', null, 'MessageTracking-Edit');
		return;
	}

	let trackingChannel = client.channels.get(messageTracking);

	//Retrieve links to any message attachments, e.g, images
	let attachmentList = message.attachments.size === 0 ? 'None' : '';
	message.attachments.forEach(attach => attachmentList += attach.proxyURL + '\n');

	//Send the message in a formatted log.
	trackingChannel.send(`\`${Date.now().toLocaleString('en-US')}: `
		+ `${message.author.username}#${message.author.tag} deleted a message in `
		+ `${message.guild.name}:${message.channel.name}\``);

	trackingChannel.send(`\`Message:\`\n${message.content}`);
	trackingChannel.send(`\`Attachments:\`\n${attachmentList}`);

	trackingChannel.send('`---------------------------------------------------------------------------------`');
});

//Login with the token supplied in config file.
client.login(token)
	.catch(() => {
		console.error('Ensure a valid token is in the config.json file.');
	});