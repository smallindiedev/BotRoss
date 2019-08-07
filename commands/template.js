/* eslint-disable */
/*

Command Properties and Their Purpose

*Name (required): The name of the command, used to activate it.
*Description: A description of the command.
*Aliases: Alternate names for the command.
*Usage: A template to demonstrate proper usage of commands with arguments.
*ArgsRequired: Include this property if you want the command to be rejected if there are no arguments.

**AllowedRoles: Useful if you want to limit a command to certain roles within your server.
**AdminOnly: Only allows users designated as admins in the config file to use the command.

**UserCooldown: Give a command a cooldown managed per user. (A global cooldown will override this)
**GlobalCooldown: Give a command a cooldown managed per text channel.

**ChannelBlacklist: A list of channel IDs that the command will NOT work on. (A channel whitelist will override this)
**ChannelWhitelist: A list of channel IDs that the command will ONLY work on.

*These properties represent general information regarding the command.
**These properties are used to limit command usage in different ways.
**NOTE: Any user id designated as admin in the config file bypasses any limits.

The included help command returns either a list of commands, or information on ALL properties within a command.

*/

module.exports = {
	name: '<Command Name>',
	description: '<Command Description>',
	//aliases: [],
	//usage: !help <command name>,
	//argsRequired: true,

	//allowedRoles: ['moderators'],
	//adminOnly,
	//userCooldown: 30,
	//globalCooldown: 10,
	//channelBlacklist: [],
	//channelWhitelist: [],
	execute(message, args) {
		//Note
		//The parameter 'message' is a direct reference to the message that activated the command.
		//The parameter 'args' is an array formed from the contents of the message, minus the command name
		//e.g If the message is "!test this is a command", args = ['this', 'is', 'a', 'command']

		message.client.log(`Sample log.`, message, this.name);
	},
};