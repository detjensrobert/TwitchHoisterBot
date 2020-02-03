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

	// if streamer is already in list
	if (!!streamers.find(elem => elem[0] == user.id)) {
		const errEmbed = new Discord.RichEmbed().setColor(config.colors.error)
			.setTitle("Oops! This streamer's already been verified.");
		return message.channel.send(errEmbed);
	}

	const member = await message.guild.fetchMember(user);

	console.log(`[ INFO ] Adding user ${user.username} to streamer list`);

	streamers.push([user.id, ""]);

	// save new array to file
	fs.writeFileSync('./streamers.json', JSON.stringify(streamers, null, 2));

	const replyEmbed = new Discord.RichEmbed().setColor(config.colors.success)
		.setTitle(`Added ${member ? member.displayName : user.username} to the verified streamer list.`);
	message.channel.send(replyEmbed);

	// fetch usernames for users in arr
	const usernames = new Map();
	streamers.forEach(async elem => {
		const u = message.client.fetchUser(elem[0]);
		const m = await message.guild.fetchMember(u);
		usernames.set(elem[0], (m ? m.displayName : u.username));
	});

	// sort streamers array by username
	streamers.sort((a, b) => { return usernames.get(a[0]) - usernames.get(b[0]); });
}

module.exports = options;
module.exports.execute = execute;
