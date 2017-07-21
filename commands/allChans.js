
//const UserRecord = require('./UserRecord.js');

module.exports.alias = [
	'allchans',
	'allChans'
];

module.exports.command = (message, content, bot) => {
	if (message.author.id != bot.owner_ID) return;

	var allch = {};
	for (var user in bot.server.users) {
		var u = bot.server.users[user];
		for (var ch in u.channels) {
			if (allch[ch]) {
				allch[ch] += u.channels[ch];
			} else {
				allch[ch] = u.channels[ch];
			}
		}
	}

	var sortable = [];
	for (var c in allch) {
	  sortable.push([c, allch[c]]);
	}

	sortable.sort(function(a, b) {
	    return b[1] - a[1];
	});

	var s = "";
  for (var i in sortable) {
		let ch = bot.server.server.channels.get(sortable[i][0]);
		if (!ch) continue;
	  s += ch.name + ": " + sortable[i][1] + "\n";
	}
  message.channel.send(s);

};