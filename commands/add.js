const config = require('../config.json');
const Discord = require('discord.js');
const fs = require('fs');
const log = require('../utils/log.js');

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
		const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
			.setTitle("Oops! User mention not recognised.")
			.addField("Usage:", `\`${config.prefix}${this.name} ${this.usage}\``);
		return message.channel.send(errEmbed);
	}

	const user = message.mentions.users.first();

	// if streamer is already in list
	if (streamers.find(elem => elem[0] == user.id)) {
		const errEmbed = new Discord.MessageEmbed().setColor(config.colors.warn)
			.setTitle("This streamer has already been added.");
		return message.channel.send(errEmbed);
	}

	const member = await message.guild.members.fetch(user);

	log.log('INFO', `Adding user ${user.username} to streamer list`);

	// streamer list is nested arrays: [ [discord userid, twitch username], ... ]
	// twitch username will be set the next time the user streams
	streamers.push([user.id, ""]);

	// sort streamer array by discord nickname
	// need to get username/nicknames first tho
	const names = new Map();
	for (let i = 0; i < streamers.length; i++) {
		const u = await message.client.users.fetch(streamers[i][0]);
		// if no member available, catch and return undefined
		const m = await message.guild.members.fetch(u.id).catch(() => undefined);
		names.set(streamers[i][0], m ? m.displayName : u.username);
	}

	streamers.sort((a, b) => { names.get(a[0]) < names.get(b[0]) ? -1 : 1; });

	// save new array to file
	fs.writeFileSync('./streamers.json', JSON.stringify(streamers, null, 2));

	const replyEmbed = new Discord.MessageEmbed().setColor(config.colors.success)
		.setTitle(`Added ${member ? member.displayName : user.username} to the verified streamer list.`);
	message.channel.send(replyEmbed);
}

module.exports = options;
module.exports.execute = execute;
