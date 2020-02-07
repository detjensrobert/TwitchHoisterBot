const config = require('../config.json');
const Discord = require('discord.js');
const log = require('../utils/log.js');

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

	log.log('INFO', "Showing streamer list at page " + page);

	// send list at page
	const replyMsg = await message.channel.send(generateEmbed(message, streamers, page));
	await replyMsg.react('⬅️');
	replyMsg.react('➡️');


	// allow paging for 1 min
	const reactFilter = (reaction, user) => !user.bot && (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️');
	const reactCollector = replyMsg.createReactionCollector(reactFilter, { time: 60 * 1000 });

	reactCollector.on('collect', (reaction, collector) => {
		const oldPage = reaction.message.embeds[0].title.match(/\d+ \/ \d+/)[0].match(/^\d+/)[0] - 1;
		let newPage = oldPage;

		// would use boolean addition but it didnt work
		if (reaction.emoji.name === '➡️') {
			newPage++;
		}
		else {
			newPage--;
		}

		newPage = Math.max(newPage, 0); // enforce limits
		newPage = Math.min(newPage, Math.ceil(streamers.length / config.pageLimit) - 1);

		// only edit on page change
		if (newPage == oldPage) return;

		log.log('INFO', "Editing list message to page " + newPage);

		replyMsg.edit(generateEmbed(message, streamers, newPage));
		reaction.remove(reaction.users.filter(u => !u.bot).first());
	});

	reactCollector.on('end', collected => {
		replyMsg.clearReactions();
	});
}

function generateEmbed(message, streamers, page) {

	const listEmbed = new Discord.RichEmbed().setColor(config.colors.twitch)
		.setTitle(`Streamer List (page ${page + 1} / ${Math.ceil(streamers.length / config.pageLimit)})`);

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
