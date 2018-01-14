module.exports.name = 'setLogChannel';

module.exports.alias = [
  'setLogChannel',
  'slc'
];

module.exports.initialize = (json, server) => {
  server.logChannel = '';
  if (!json || !json['logChannel']) return;
  server.logChannel = json['logChannel'];
};

module.exports.isAllowed = (message) => {
  return message.member.hasPermission('ADMINISTRATOR');
};

module.exports.help = '__Mods Only__ Sets the log channel';

module.exports.command = (message, content, bot, server) => { 
  let chan = server.guild.channels.get(content);
  if (chan) {
    server.logChannel = chan.id;
    message.channel.send(`${chan} is set as the new log channel now.`);
  } else if (message.mentions.channels.size != 0) {
    chan = message.mentions.channels.first();
    server.logChannel = chan.id;
    message.channel.send(`${chan} is set as the new log channel now.`);
  }
};
