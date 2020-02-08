const c = require('chalk');

function log(type, message) {
	const d = new Date();
	let str = " ";
	switch (type) {
	case 'START':
		str += c.cyan(type);
		break;
	case ' INFO':
		str += c.green(type);
		break;
	case ' WARN':
		str += c.yellow(type);
		break;
	case ' ERR!':
		str += c.red(type);
		break;
	default:
		str += c.grey(type);
	}

	console.log(c.white("[ ")+c.grey(d.toLocaleDateString()) + " " + c.grey(d.toLocaleTimeString())+ str + c.white(" ] ")+c.reset(message));
}

module.exports.log = log;
