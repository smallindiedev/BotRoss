## About
A Discord bot designed with [Node.js](https://nodejs.org) and [Discord.js](https://github.com/discordjs/discord.js).

This bot is designed to have each chat command be an individual .js file in the ./commands directory. There is a template file detailing the various properties that can be added to each command. The main bot.js script handles the implementation of these properties, typically designed to assist in managing command usage.
The design of this bot allows for a more modular approach to adding and removing functionality.

## Setup
Before running the bot for the first time, make sure the appropriate fields in your [config.json](#config-options) file are filled out.

`npm install`, in the bot's directory will download packages listed in the package.json file, along with their dependencies.
`npm start bot.js`, will begin running the main bot script. Assuming you have already created a bot user and invited it to your server in Discord, you should see the bot's status switch to online almost immediately. If not, then the most likely error, short of any bugs in the code, is that a valid token was not supplied in the config.json file.

Personally, I recommend running the process through a process manager like [PM2](https://pm2.io/doc/en/runtime/overview/). The most helpful features being an easy way to view console logs and automatically restart the process in the event of a failure.

## Commands
**Help**: The help command lists all commands currently loaded by the bot. If an argument is supplied, the command lists detailed information about the command, i.e `!help help`.
**Play**: Streams music from Youtube in the same voice channel as whoever activated the command. Either a specific video can be provided by ID, i.e !play {Video ID}, or the first result of a search is used, i.e !play search {Very Cool Search Terms}.
**Exec**: Has the bot execute any JavaScript code that follows the command name. I mainly use it to easily control the bot user from Discord. It's currently designated adminOnly, but I would advise either stronger protections or outright removing the command if you plan on designating anyone other than yourself an admin, or if you don't need the commands capabilities.

## FAQ
Questions that no one has asked.

**Why is it called BotRoss?** Because I gave my bot's user account a Bob Ross profile picture and I thought it was funny.


____
### Config Options
Descriptions of the properties found in the config.json file.

*Token*: This is the only required field, and represents the login token of your bot's user account. If this if your first time handling something like this, head to the [Discord Dev Portal](https://discordapp.com/developers/applications/). From there, you can create an application, attach a bot user to said application, and view its token.
  **Obligatory Note**: Do not share this token with anyone, or they can use it to access your bot's user account.

*Prefix*:
Defaults to '!'. This represents what you would like to use to denote bot commands in Discord, i.e !help. This can theoretically be a string of any length, although an uncommonly used symbol would be advised.

*Admin*:
An array of *User IDs* that you would like to designate as admins for the bot. In general, admins are not restricted by any properties on commands, such as cooldowns and blacklisted channels. To get a user's User ID, right click on their name in Discord and select 'Copy ID' (requires Developer Mode to be enabled).

*MessageTracking*:
The *Channel ID* of a text channel to use for logging message changes. Leave this as 0 to keep this functionality disabled. If set to a valid channel ID, any edited and deleted messages are copied to this channel by the bot. This is purely meant to help moderate messages before their contents can be changed/hidden.
