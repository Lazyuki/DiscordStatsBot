module.exports = class UserRecord {
  constructor(arg) {
    if (arg) { // build from backup
      this.record = arg.record;
      this.thirty = arg.thirty;
      this.chans = arg.chans;
    } else { // build from scratch
      this.record = new Array(31); //31 days
      this.thirty = 0;
      this.chans = {}; // {<channel ID>: # messages, <ID>: #}
    }
  }

  // channelID in string, today is an int between 0-30
  add(content, channelID, today) {
    this.thirty++;
    if (!this.record[today]) {
      this.record[today] = {};
      this.record[today][channelID] = 0;
    } else if (!this.record[today][channelID]) {
      this.record[today][channelID] = 0;
    }
    if (!this.chans[channelID]) {
      this.chans[channelID] = 0;
    }
    this.chans[channelID]++;
    this.record[today][channelID]++;
  }

  addReacts(today) {
    if (!this.record[today]['rxn']) {
      this.record[today]['rxn'] = 0;
    }
    this.record[today]['rxn']++;
  }

  totalStats() {
    return this.thirty;
  }

  channelStats(channelID) {
    let result = this.chans[channelID];
    return result ? result : 0;
  }

  // Cleans up the old messages.
  // Returns true if this user hasn't spoken in the last 30 days.
  adjust(today) {
    let earliestDay = (today) % 31; // (today - 1) % 30?
    for (var chan in this.record[earliestDay]) {
      let num = this.record[earliestDay][chan];
      this.chans[chan] -= num;
      if (this.chans[chan] <= 0) {
        delete this.chans[chan]; // if the user hasn't spoken in this channel
      }
      this.thirty -= num;
      delete this.record[earliestDay][chan];

    }
    //this.record[earliestDay] == {};
    return this.thirty == 0;
  }
};
