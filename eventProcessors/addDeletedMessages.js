module.exports.name = 'addDeletedMessages';
module.exports.events = ['DELETE'];


const SimpleMsg = require('../classes/SimpleMessage.js');
const Util = require('../classes/Util.js');

module.exports.initialize = (json, server) => {
  server.deletedMessages = [];
  if (!json || !json['deletedMessages']) return;
  for (var msg in json['deletedMessages']) {
    let dm = json['deletedMessages'][msg];
    server.deletedMessages.push(new SimpleMsg({simple:dm}));
  }
};
module.exports.isAllowed = () => {
  return true;
};

module.exports.process = async function(message, server) {
  var imageURL = '';
  if (message.attachments.size > 0) {
    imageURL = message.attachments.first().url;
    message.content += `\n{Attachment (expires soon): ${imageURL} }`;
  } else if (message.content.length < 3) {
    return;
  }
  var simple = new SimpleMsg({message : message, del : true});
  if (server.watchedUsers.includes(message.author.id)) {
    let timeout = 0;
    if (simple.dur < 5) {
      timeout = 5 - simple.dur * 1000;
    }
    setTimeout(function() {
      let index = server.watchedImagesID.indexOf(message.id);
      if (index != -1) {
        simple.img = server.watchedImagesLink[index];
      }
      Util.postLogs(simple, server);
    }, timeout);
  }
};