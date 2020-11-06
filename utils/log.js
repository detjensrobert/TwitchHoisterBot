const c = require('chalk');

async function log(type, message) {
	const d = new Date();
	let str;
	switch (type) {
	case 'START':
		str = c.cyan(type);
		break;
	case 'INFO':
		str = c.green(type);
		break;
	case 'WARN':
		str = c.yellow(type);
		break;
	case 'ERROR':
		str = c.red(type);
		break;
	default:
		str = c.grey(type);
	}

	console.log(c.grey("[ ") + str + c.grey(" ] ") + c.reset(message));
}

module.exports.log = log;
