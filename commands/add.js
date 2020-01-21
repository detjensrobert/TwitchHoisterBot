const config = require('../config.json');
const Discord = require('discord.js');

const options = {

	name: 'add',
	aliases: ['a', 'verify'],

	usage: '<@USER>',

	description: 'Adds a user to the verified streamer list.',

	cooldown: 3,
	minArgs: 1,

	roleRestrict: 'moderator',
};

async function execute(message, args) {

	// CODE HERE

}

module.exports = options;
module.exports.execute = execute;
