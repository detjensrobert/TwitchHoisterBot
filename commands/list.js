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
	const reactFilter = (reaction, user) => user.id == message.author.id && (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️');
	const reactCollector = replyMsg.createReactionCollector(reactFilter, { time: 60 * 1000 });

	reactCollector.on('collect', (reaction, reaction_user) => {
		const oldPage = reaction.message.embeds[0].footer.text.match(/\d+ \/ \d+/)[0].match(/^\d+/)[0] - 1;
		let newPage = oldPage;

		// would use boolean addition but it didnt work
		if (reaction.emoji.name === '➡️') {
			newPage++;
		}
		else {
			newPage--;
		}

		// enforce limits
		newPage = Math.max(newPage, 0);
		newPage = Math.min(newPage, Math.ceil(streamers.length / config.pageLimit) - 1);

		log.log('INFO', "Editing list message to page " + newPage);

		replyMsg.edit(generateEmbed(message, streamers, newPage));
		replyMsg.reactions.resolve(reaction).users.remove(reaction_user.id);
	});

	reactCollector.on('end', (_collected, _reason) => {
		replyMsg.reactions.removeAll();
	});
}

function generateEmbed(message, streamers, page) {

	const listEmbed = new Discord.MessageEmbed().setColor(config.colors.twitch)
		.setTitle("Streamer List")
		.setFooter(`*Page ${page + 1} of ${Math.ceil(streamers.length / config.pageLimit)}*`);

	// if no streamers configured
	if (streamers.length == 0) {
		return listEmbed.addField("No streamers added", `Use \`${config.prefix}add @user\` to get started!`);
	}

	const streaming = message.guild.roles.cache.get(config.roles.streaming).members;

	if (streaming.size > 0) {
		let streamingStr = "";

		for (const id of streaming.keys()) {
			const url = streamers.find(elem => elem[0] == id)[1];
			streamingStr += `<@${id}>: [${url}](${url}})\n\n`;
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
			allStr += `<@${id}>: [ url not found ]\n\n`;
		}
	}

	listEmbed.addField("Verified Streamers", allStr);

	return listEmbed;
}

module.exports = options;
module.exports.execute = execute;
