const config = require('../config.json');
const Discord = require('discord.js');

const options = {

	name: 'list',
	aliases: ['l', 'ls'],

	description: 'Displays a pageable list of all verified streamers.',

	cooldown: 3,
};

async function execute(message, args, streamers) {

	console.log("[ INFO ] Showing streamer list");

	let streamerStr = "";
	for (const [id, url] of streamers.entries()) {
		streamerStr += `<@${id}>: ${url}\n`;
	}

	const listEmbed = new Discord.RichEmbed().setColor(config.colors.info)
		.setTitle("Verified Streamers")
		.setDescription(streamerStr);
	message.channel.send(listEmbed);

}

module.exports = options;
module.exports.execute = execute;
