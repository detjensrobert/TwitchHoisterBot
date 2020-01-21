const config = require('../config.json');
const Discord = require('discord.js');

const options = {

	name: 'remove',
	aliases: ['r'],

	usage: '<@USER>',

	description: 'Removes a user from the verfied streamer list',

	cooldown: 3,
	minArgs: 1,

	roleRestrict: 'moderator',
};

async function execute(message, args) {

	// CODE HERE

}

module.exports = options;
module.exports.execute = execute;
