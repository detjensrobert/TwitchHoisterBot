const config = require('../config.json');
const Discord = require('discord.js');

const options = {

	name: 'list',
	aliases: ['l', 'ls'],

	description: 'Displays a pageable list of all verified streamers.',

	roleRestrict: "moderator",
	cooldown: 3,
};

async function execute(message, args, streamers) {

	console.log("[ INFO ] Showing streamer list");

	const listEmbed = new Discord.RichEmbed().setColor(config.colors.twitch)
		.setTitle("Streamer List");

	const streaming = message.guild.roles.get(config.roles.streaming).members;

	if (streaming.size > 0) {
		let streamingStr = "";

		for (const id of streaming.keys()) {
			const usn = streamers.find(elem => elem[0] == id)[1];
			streamingStr += `<@${id}>: [${usn}](https://twitch.tv/${usn})\n\n`;
		}
		listEmbed.addField("Currently Streaming", streamingStr);
	}

	let allStr = "";
	for (const [id, usn] of streamers) {
		allStr += `<@${id}>: [${usn}](https://twitch.tv/${usn})\n\n`;
	}

	listEmbed.addField("Verified Streamers", allStr);

	message.channel.send(listEmbed);

}

module.exports = options;
module.exports.execute = execute;
