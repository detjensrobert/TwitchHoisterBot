console.log("[ START ] Starting up...");
const Discord = require('discord.js');
const client = new Discord.Client();

// file i/o
const fs = require('fs');

// grab settings from file
const { token } = require('./token.json');
const config = require('./config.json');

// load saved streamers from file (or template if no file)
let streamers;
if (fs.existsSync('./streamers.json')) {
	console.log("[ START ] Loading streamers from file...");
	streamers = require('./streamers.json');
}
else {
	console.log("[ START ] No streamers file found, using blank template...");
	streamers = [];
}

// import commands from dir
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require('./commands/' + file);
	client.commands.set(command.name, command);

	console.log("[ START ] Added command: " + command.name);
}

const cooldowns = new Discord.Collection();


// ========


client.once('ready', () => {
	console.log(`[ START ] Ready.`);
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


	//   ===   CHECK COMMAND OPTIONS   ===


	// role restricted
	if (command.roleRestrict && !message.member.roles.has(config.roles[`${command.roleRestrict}`])) { return; }

	// argument count
	if (command.minArgs && args.length < command.minArgs) {
		const errEmbed = new Discord.RichEmbed().setColor(config.colors.error)
			.setTitle("Oops! Are you missing something?")
			.addField("Usage:", `\`${config.prefix}${command.name} ${command.usage}\``);
		return message.channel.send(errEmbed);
	}

	// == COOLDOWN HANDLING ==
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
				const errEmbed = new Discord.RichEmbed().setColor(config.colors.error)
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
client.on('presenceUpdate', (oldMember, newMember) => {

	const index = streamers.findIndex(elem => elem[0] == newMember.id);

	// ignore users not being watched (not in array)
	if (index == -1) return;

	// log old and new presence
	// ~ console.log("\n\npresence update for " + oldMember.user.username);
	// ~ console.log("OLD:");
	// ~ console.log({ ...oldMember.presence });
	// ~ if (oldMember.game) {
	// ~ console.log({ ...oldMember.presence.game });
	// ~ }
	// ~ console.log("\nNEW:");
	// ~ console.log({ ...newMember.presence });
	// ~ if (newMember.game) {
	// ~ console.log({ ...newMember.presence.game });
	// ~ }

	// if started streaming S&S, add role & set twitch url
	if (newMember.presence.game && newMember.presence.game.type == 1 && newMember.presence.game.state == 'Pokémon Sword/Shield') {
		console.log(`[ INFO ] ${newMember.username} started streaming at ${newMember.presence.game.url}`);
		newMember.addRole(newMember.guild.roles.get(config.roles.streaming));
		streamers[index][1] = newMember.presence.game.url;
	}

	// if stopped streaming OR is no longer streaming Pk S&S, remove role
	if (oldMember.presence.game && oldMember.presence.game.type == 1 && oldMember.presence.game.state == 'Pokémon Sword/Shield' &&
		(!newMember.presence.game || newMember.presence.game.state != 'Pokémon Sword/Shield')) {
		console.log(`[ INFO ] ${newMember.username} stopped streaming`);
		newMember.removeRole(newMember.guild.roles.get(config.roles.streaming));
	}

});


// ========

// login to Discord
console.log("[ START ] Logging in to Discord...");
client.login(token);

// catch and log promise rejections
process.on('unhandledRejection', error => console.error('[ ERROR ] Uncaught Promise Rejection!\n', error));
