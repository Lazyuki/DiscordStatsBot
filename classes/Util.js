const Discord = require('discord.js');
exports.REGEX_URL = /https?:\/\/(www\.)?\S{2,256}\.[a-z]{2,6}\S*/g;
exports.REGEX_REACT = /<a?:[\S]+:\d+>/g;
exports.REGEX_USER = /<@!?\d+>/g;
exports.REGEX_CHAN = /<#\d+>/g;
exports.REGEX_ROLE = /<@&\d+>/g;
exports.REGEX_ID = /<(@!?|#|@&|a?:[\S]+:)\d+>/g;

exports.searchUser = function(message, content, server) {
  let mentions = message.mentions.users;
  content = content.trim();
  if (mentions.size != 0) {
    return mentions.first();
  } else if (content != '') { // search name
    let regex = content[0] == '*';
    if (regex) {
      let r = new RegExp(content.substr(1, content.length), 'i');
      for (let id in server.users) {
        let u = server.guild.members.get(id); // TODO change to fetch?
        if (u == undefined) continue; // if left
        if (r.test(u.user.tag) || r.test(u.nickname)) {
          return u.user;
        }
      }
    } else {
      content = content.toLowerCase();
      for (let id in server.users) {
        if (id == content) { // ID search
          server.guild.fetchMember(id).then((member) => {
            return member ? member.user : null;
          });
        }
        let u = server.guild.members.get(id); // TODO change to fetch?
        if (u == undefined) continue; // if left
        if (u.user.tag.toLowerCase().startsWith(content) || (u.nickname && u.nickname.toLowerCase().startsWith(content))) {
          return u.user;
        }
      }
    }
  }
  return null;
};

exports.postLogs = function(msg, server) {
  let chan = server.guild.channels.get(server.logChannel); // #mod_log
  if (chan == undefined) return;
  let embed = new Discord.RichEmbed();
  let date = new Date(msg.time);
  embed.setAuthor(`${msg.atag} ID: ${msg.aid}` ,msg.apfp);
  if (msg.del) { // message was deleted
    embed.title = `Message Deleted after ${msg.dur} seconds`;
    embed.description = msg.con;
    embed.color = Number('0xDB3C3C');
  } else { // message was edited
    embed.title = `Message Edited after ${msg.dur} seconds`;
    embed.addField('Before:', `${msg.con}`, false);
    embed.addField('After:', `${msg.acon}`, false);
    embed.color = Number('0xff9933');
  }
  embed.setFooter(`#${msg.ch}`);
  embed.timestamp = date;
  if (msg.img != '') { // if != null
    embed.addField('imgur link', msg.img, false);
    embed.setThumbnail(msg.img);
  }
  chan.send({embed});
};
