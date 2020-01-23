const config = require('../config.json');
const Discord = require('discord.js');
const fs = require('fs');

const options = {

	name: 'add',
	aliases: ['a', 'verify', 'v'],

	usage: '<@USER>',

	description: 'Adds a user to the verified streamer list.',

	cooldown: 3,
	minArgs: 1,

	roleRestrict: 'moderator',
};

async function execute(message, args, streamers) {

	// if no user mentioned
	if (!message.mentions.users.size) {
		const errEmbed = new Discord.RichEmbed().setColor(config.colors.error)
			.setTitle("Oops! User mention not recognised.")
			.addField("Usage:", `\`${config.prefix}${this.name} ${this.usage}\``);
		return message.channel.send(errEmbed);
	}

	const user = message.mentions.users.first();
	const member = await message.guild.fetchMember(user);

	console.log(`[ INFO ] Adding user ${user.username} to streamer list`);

	streamers.set(user.id, "[No twitch link found yet]");

	// generate array from map, save it to file
	fs.writeFileSync('./streamers.json', JSON.stringify([...streamers], null, 2));

	const replyEmbed = new Discord.RichEmbed().setColor(config.colors.success)
		.setTitle(`Marked ${member ? member.displayName : user.username} as a verified streamer.`);
	return message.channel.send(replyEmbed);
}

module.exports = options;
module.exports.execute = execute;
