const Discord = require('discord.js');
const init = require('./init.json');
const Server = require('./classes/Server.js');
const midnightTask = require('./classes/MidnightTask.js');
const savingTask = require('./classes/SavingTask.js');
let cmds = require('./cmds.js');
const commands = cmds.commands;
const inits = cmds.inits;
const prcs = require('./prcs.js');

// Set up Discord client settings.
// Note: Disabling other events such as user update tends to break the code.
const bot = new Discord.Client({
  disableEveryone: true,
  disabledEvents: [
    'TYPING_START'
  ]
});

// Load initial configurations.
const token = init.token;
bot.owner_ID = init.owner_ID;

// Initialize bot and servers.
bot.on('ready', () => {
  setTimeout(() => { // Set up hourly backup state task
    savingTask(bot);
  },  60*60*1000);
  let time = new Date();
  let h = time.getUTCHours();
  let m = time.getUTCMinutes();
  let s = time.getUTCSeconds();
  let timeLeft = (24*60*60) - (h*60*60) - (m*60) - s;
  setTimeout(() => { // Set up the day changing task
    midnightTask(bot);
  },  timeLeft * 1000); // Time left until the next day
  console.log('Logged in as ' + bot.user.username);
  console.log(`${time.toLocaleDateString()} ${time.toLocaleTimeString()}`);
  console.log(`${bot.guilds.size} servers`);
  console.log('--------------------------');
  bot.servers = {};
  for (let guild of bot.guilds.values()) {
    bot.servers[guild.id] = new Server(guild, inits, prcs);
  }
  let helps = [',help',',h',',halp',',tasukete'];
  bot.user.setGame(helps[Math.floor(Math.random() * helps.length)]);
});

bot.on('message', async message => {
  if (message.author.bot || message.system) return;
  if (message.channel.type != 'text') { // Direct message.
    respondDM(message);
    return;
  }
  let server = bot.servers[message.guild.id];
  // Is it a command?
  if (!message.content.startsWith(server.prefix)) {
    server.processNewMessage(message, bot);
    return;
  }
  // Separate the command and the content
  let command = message.content.split(' ')[0].slice(1).toLowerCase();
  let content = message.content.substr(command.length + 2).trim();
  if (!commands[command]) { // if not Ciri bot command, add it.
    server.processNewMessage(message, bot);
    return;
  }
  // Defaults to EJLX 
  if (message.guild.id == '293787390710120449') server = bot.servers['189571157446492161']; 
  commands[command].command(message, content, bot, server, cmds);
});

bot.on('messageUpdate', (oldMessage, newMessage) => {
  if (oldMessage.author.bot || oldMessage.system) return;
  if (oldMessage.content == newMessage.content) return; // Discord auto embed for links.
  if (oldMessage.channel.type != 'text') return;
  if (oldMessage.guild.id == '293787390710120449') return; // Ignore my server
  bot.servers[oldMessage.guild.id].addEdits(oldMessage, newMessage, bot);
});

bot.on('messageDelete', message => {
  if (message.author.bot || message.system) return;
  if (message.channel.type != 'text') return;
  if (message.guild.id == '293787390710120449') return; // Ignore my server
  bot.servers[message.guild.id].addDeletedMessage(message);
});

bot.on('messageDeleteBulk', messages => {
  let m = messages.first();
  if (m.author.bot || m.system) return;
  if (m.channel.type != 'text') return;
  if (m.guild.id == '293787390710120449') return; // Ignore my server
  for (let [, message] of messages) {
    bot.servers[message.guild.id].addDeletedMessage(message);
  }
});

bot.on('messageReactionAdd', async (reaction, user) => {
  let m = reaction.message;
  if (user.bot) return;
  if (m.channel.type != 'text') return;
  if (m.guild.id == '293787390710120449') return; // Ignore my server
  bot.servers[m.guild.id].processReaction(reaction, user, true);
});

bot.on('messageReactionRemove', async (reaction, user) => {
  let m = reaction.message;
  if (user.bot) return;
  if (m.channel.type != 'text') return;
  if (m.guild.id == '293787390710120449') return; // Ignore my server
  bot.servers[reaction.message.guild.id].processReaction(reaction, user, false);
});
/*
bot.on('userUpdate', (oldUser, newUser) => {
  for (let server of bot.servers.values()) {
    server.userUpdate(oldUser, newUser);
  }
});
*/
bot.on('guildMemberAdd', member => {
  if (member.guild.id == '293787390710120449') return; // Ignore my server
  bot.servers[member.guild.id].addNewUser(member.id);
});

bot.on('guildBanAdd', (guild, user) => {
  if (guild.id == '293787390710120449') return;// Ignore my server
  let index = bot.servers[guild.id].watchedUsers.indexOf(user.id);
  if (index == -1) return;
  bot.servers[guild.id].watchedUsers.splice(index, 1);
});

bot.on('guildCreate', guild => {
  bot.servers[guild.id] = new Server(guild, inits, prcs);
  console.log(`Server added: ${guild.name}`);
});

bot.on('guildDelete', guild => {
  let index = bot.servers.indexOf(guild.id);
  if (index == -1) return;
  bot.servers.splice(index, 1);
  console.log(`Server removed: ${guild.name}`);
});

// Response to a DM since it's not supported there
function respondDM(message) {
  let msgs = [
    'Come on... I\'m not available here... \n https://media3.giphy.com/media/mfGYunx8bcWJy/giphy.gif',
    '*sigh* Why did you PM me https://68.media.tumblr.com/d0238a0224ac18b47d1ac2fbbb6dd168/tumblr_nselfnnY3l1rpd9dfo1_250.gif',
    'I don\'t work here ¯\\\_(ツ)_/¯ http://cloud-3.steamusercontent.com/ugc/576816221180356023/FF4FF60F13F2A773123B3B26A19935944480F510/'];
  let msg = msgs[Math.floor(Math.random() * msgs.length)];
  message.channel.send(msg);
}

process.on('unhandledRejection', console.dir); // Show stack trace on unhandled rejection.

// Log in. This should be the last call
bot.login(token);