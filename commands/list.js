const config = require('../config.json');
const Discord = require('discord.js');

const options = {

	name: 'list',
	aliases: ['l', 'ls'],

	usage: '<PAGE (optional)>',

	description: 'Displays a pageable list of all verified streamers.',

	roleRestrict: "moderator",
	cooldown: 3,
};

async function execute(message, args, streamers) {

	// if page specified, use that; else first page
	let page = Number.parseInt(args.shift()) - 1;
	if (isNaN(page)) page = 0;

	console.log("[ INFO ] Showing streamer list at page " + page);

	// send list at page
	message.channel.send(generateEmbed(message, streamers, page));

}

function generateEmbed(message, streamers, page) {

	const listEmbed = new Discord.RichEmbed().setColor(config.colors.twitch)
		.setTitle(`Streamer List (page ${page + 1} / ${Math.ceil(streamers.length / 10)})`);

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
	const streamersPage = streamers.slice(page * config.pageLimit, (page + 1) * config.pageLimit);
	for (const [id, usn] of streamersPage) {
		if (usn.length) {
			allStr += `<@${id}>: [${usn}](https://twitch.tv/${usn})\n\n`;
		}
		else {
			allStr += `<@${id}>: [ twitch url not found ]\n\n`;
		}
	}

	listEmbed.addField("Verified Streamers", allStr);

	return listEmbed;
}

module.exports = options;
module.exports.execute = execute;
