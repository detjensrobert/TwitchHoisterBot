console.log("[ START ] Starting up...");
const Discord = require('discord.js');
const client = new Discord.Client();
const log = require('./utils/log.js');

// file i/o
const fs = require('fs');

// grab settings from file
const { token } = require('./token.json');
const config = require('./config.json');

// load saved streamers from file (or template if no file)
let streamers;
if (fs.existsSync('./streamers.json')) {
	log.log('START', "Loading streamers from file...");
	streamers = require('./streamers.json');
}
else {
	log.log('START', "No streamers file found, using blank template...");
	streamers = [];
}

// import commands from dir
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require('./commands/' + file);
	client.commands.set(command.name, command);

	log.log('START', "Added command: " + command.name);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	// check role on startup
	log.log('START', `Checking for orphaned stream hoists...`);
	for (const guild of client.guilds.cache.values()) {
		while	(!guild.available) { /* wait for guild to become available */ }
		log.log('START', `  > in ${guild.name}`);
		const streamingRole = guild.roles.cache.get(config.roles.streaming);
		const streaming = streamingRole ? streamingRole.members : false;

		if (streaming && streaming.size > 0) {
			for (const member of streaming.values()) {
				// if stopped streaming, remove streaming role
				let stream;
				if (member.presence.activities) stream = member.presence.activities.find(e => e.type == 'STREAMING');
				if (!stream || !config.games.includes(stream.name)) {
					log.log('START', `    - ${member.user.username}`);
					member.roles.remove(member.guild.roles.cache.get(config.roles.streaming));
				}
			}
		}
	}

	log.log('START', "Ready.");
});

client.on('message', message => {
	// ignore messages that dont start with a valid prefix
	if (!message.content.startsWith(config.prefix)) return;

	// ignore bot messages
	if (message.author.bot) return;

	// ignore DMs
	if (message.channel.type !== "text") return;

	// ignore messages not in specified channels, if given
	if (config.restrictToChannels && !config.restrictToChannels.includes(message.channel.id)) return;

	// turn message into array
	const args = message.content.trim().slice(config.prefix.length).split(/ +/);

	// pull first word (the command) out
	const commandName = args.shift().toLowerCase();

	// get command from name or alias
	const command = client.commands.get(commandName) ||
					client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	// CHECK COMMAND OPTIONS:
	// role restricted
	if (command.roleRestrict && !message.member.roles.cache.has(config.roles[`${command.roleRestrict}`])) return;

	// argument count
	if (command.minArgs && args.length < command.minArgs) {
		const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
			.setTitle("Oops! Are you missing something?")
			.addField("Usage:", `\`${config.prefix}${command.name} ${command.usage}\``);
		return message.channel.send(errEmbed);
	}

	// cooldown handling
	if (command.cooldown) {
		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}
		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;
		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				const errEmbed = new Discord.MessageEmbed().setColor(config.colors.error)
					.setTitle(`Wait ${timeLeft.toFixed(1)} more second(s) to call this again.`);
				return message.channel.send(errEmbed);
			}
		}
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	// since everything's ok, execute command
	command.execute(message, args, streamers);
});

// listen for user presence updates
client.on('presenceUpdate', (oldPresence, newPresence) => {
	// find user id in streamers
	const index = streamers.findIndex(elem => elem[0] == newPresence.user.id);
	// ignore users not being watched (not in array)
	if (index == -1) return;

	// find streaming activities
	let oldStream, newStream;
	if (oldPresence && oldPresence.activities) oldStream = oldPresence.activities.find(e => e.type == 'STREAMING');
	if (newPresence && newPresence.activities) newStream = newPresence.activities.find(e => e.type == 'STREAMING');

	// ignore if not streaming at all
	if (!oldStream && !newStream) return;

	// if started streaming a game, add role & set twitch url
	if (newStream && (!config.gameRestrict || config.games.includes(newStream.name))
	&& (!oldStream || (!config.gameRestrict || config.games.includes(oldStream.name)))) {
		log.log('INFO', `${newPresence.user.username} started streaming at ${newStream.url}`);
		newPresence.member.roles.add(config.roles.streaming);
		streamers[index][1] = newStream.url;
		return;
	}

	// if stopped streaming, remove streaming role
	if (oldStream && (!config.gameRestrict || config.games.includes(oldStream.name))
	&& (!newStream || (!config.gameRestrict || config.games.includes(newStream.name)))) {
		log.log('INFO', `${oldPresence.user.username} stopped streaming`);
		oldPresence.member.roles.remove(config.roles.streaming);
		return;
	}
});

// login to Discord
log.log('START', "Logging in to Discord...");
client.login(token);

// catch and log promise rejections
process.on('unhandledRejection', error => {
	log.log('ERROR', "Uncaught Promise Rejection!\n" + error);
	console.error("Uncaught Promise Rejection!\n", error);
});
