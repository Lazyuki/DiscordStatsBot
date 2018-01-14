module.exports.name = 'setPrefix';

module.exports.alias = [
  'prefix'
];

module.exports.initialize = (json, server) => {
  server.prefix = ',';
  if (!json || !json['prefix']) return;
  server.prefix = json['prefix'];
};

module.exports.isAllowed = (message) => {
  return message.member.hasPermission('ADMINISTRATOR');
};

module.exports.help = '__Mods Only__ Sets the bot\'s prefix';

module.exports.command = (message, content, bot, server) => {
  
  if (content.length > 0) {
    server.prefix = content;
    message.channel.send(`The new prefix is ${content}`);
  }
};
