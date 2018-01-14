module.exports.name = 'pruneMessages';

module.exports.alias = [
  'prune'
];
module.exports.isAllowed = (message) => {
  return message.member.hasPermission('ADMINISTRATOR');
};

module.exports.help = '__Mods Only__ Deletes messages sent by specified users in the channel in the past 24 hours. Use their IDs. `,prune 123454323454 2345432345643 4543246543234`';

module.exports.command = async (message, content) => {
  var ids = content.split(' ');
  var lastMessageID = message.id;
  var done = false;
  var now = (new Date()).getTime();
  var day = 24 * 60 * 60 * 1000;
  var count = 0;
  var delCount = 0;
  while (!done) {
    let messages = await message.channel.fetchMessages({limit:100,before:lastMessageID});
    let delMsgs = [];
    let num = 0;
    for (var m of messages.values()) {
      count++;
      if (++num == 100) {
        if (now - m.createdAt.getTime() > day) {
          done = true;
          break;
        } else {
          lastMessageID = m.id;
        }
      }
      if (ids.indexOf(m.author.id) != -1) {
        delMsgs.push(m);
        delCount++;
      }
    }
    if (delMsgs.length > 1) {
      try {
        message.channel.bulkDelete(delMsgs);
      } catch (e) {
        console.log(e.message);
        return;
      }
    }
  }
  message.channel.send(`Checked ${count} messages and deleted ${delCount} messages!`);
};
