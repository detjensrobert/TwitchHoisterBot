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

	const listEmbed = new Discord.RichEmbed().setColor(config.colors.info)
		.setTitle("Streamer List");

	const streaming = message.guild.roles.get(config.roles.streaming).members;

	if (streaming.size > 0) {
		let streamingStr = "";
		for (const id of streaming.keys()) {
			streamingStr += `<@${id}>: ${streamers.get(id)}\n`;
		}
		listEmbed.addField("Currently Streaming", streamingStr);
	}

	let streamerStr = "";
	for (const [id, url] of streamers.entries()) {
		streamerStr += `<@${id}>: ${url}\n`;
	}

	listEmbed.addField("Verified Streamers", streamerStr);

	message.channel.send(listEmbed);

}

module.exports = options;
module.exports.execute = execute;
