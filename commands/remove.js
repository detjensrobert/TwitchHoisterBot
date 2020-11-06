const config = require('../config.json');
const Discord = require('discord.js');
const fs = require('fs');
const log = require('../utils/log.js');

const options = {

	name: 'remove',
	aliases: ['r', 'delete', 'd'],

	usage: '<@USER>',

	description: 'Removes a user from the verfied streamer list',

	cooldown: 3,
	minArgs: 1,

	roleRestrict: 'moderator',
};

async function execute(message, args, streamers) {

	// if no user mentioned
	if (!message.mentions.users.size) {
		const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
			.setTitle("Oops! User mention not recognised.")
			.addField("Usage:", `\`${config.prefix}${this.name} ${this.usage}\``);
		return message.channel.send(errEmbed);
	}

	const user = message.mentions.users.first();

	// if user is not in list
	if (!streamers.find(elem => elem[0] == user.id)) {
		const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
			.setTitle("Oops! User is not in the streamer list.");
		return message.channel.send(errEmbed);
	}

	const member = await message.guild.members.fetch(user);

	log.log('INFO', `Removing user ${user.username} from streamer list`);

	// remove pair at index of id
	streamers.splice(streamers.findIndex(elem => elem[0] == user.id), 1);

	// save new array to file
	fs.writeFileSync('./streamers.json', JSON.stringify(streamers, null, 2));

	const replyEmbed = new Discord.MessageEmbed().setColor(config.colors.success)
		.setTitle(`Removed ${member ? member.displayName : user.username} from the streamer list.`);
	return message.channel.send(replyEmbed);

}

module.exports = options;
module.exports.execute = execute;
