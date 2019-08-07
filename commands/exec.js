module.exports = {
	name: 'exec',
	description: 'Execute an inline command',
	adminOnly: true,
	execute(message) {
		const command = clean(message.content.slice((this.name + ' ').length));
		console.log((new Date().toLocaleString('en-US')) + `: Running custom command. ('${this.name}' by ${message.author.username})\n${command}\n`);
		try
		{
			eval(command);
		}
		catch (error)
		{
			console.error(error);
			console.log((new Date().toLocaleString('en-US')) + `: Command failed to run. ('${this.name}' by ${message.author.username})`);
			message.reply('Failure to execute the command.');
		}
	},
};

function clean(text) {
	if (typeof (text) === 'string')
		return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
	else
		return text;
}