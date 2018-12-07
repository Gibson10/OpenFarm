import { Meteor } from 'meteor/meteor';

Meteor.methods({
  //Set activity feed as read.
  'feedRead': function() {
      check(this.userId, String);
      let feeds = Feeds.find({ userID: this.userId, read: false }).fetch();
      for (let i = 0; i < feeds.length; i++) {
          Feeds.update({ _id: feeds[i]._id }, { $set: { read: true } });
      }
  }
});
