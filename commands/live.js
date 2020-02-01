const config = require('../config.json');
const Discord = require('discord.js');

const options = {

	name: 'live',
	aliases: ['streaming'],

	description: 'Displays a pageable list of currently live streamers.',

	cooldown: 3,
};

async function execute(message, args, streamers) {

	console.log("[ INFO ] Showing streamer list");

	const streaming = message.guild.roles.get(config.roles.streaming).members;

	let descStr = "";

	if (streaming.size > 0) {
		for (const id of streaming.keys()) {
			const usn = streamers.find(elem => elem[0] == id)[1];
			descStr += `<@${id}>: [${usn}](https://twitch.tv/${usn})\n\n`;
		}
	}
	else {
		descStr = "*There's noone live right now* :(";
	}

	const listEmbed = new Discord.RichEmbed().setColor(config.colors.twitch)
		.setTitle("Currently Streaming")
		.setDescription(descStr);

	message.channel.send(listEmbed);

}

module.exports = options;
module.exports.execute = execute;
