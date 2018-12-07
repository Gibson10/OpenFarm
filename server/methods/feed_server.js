import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  //Generate activity feed for user.
  'insertFeed': function(action, recUser, listing, linkid) {
    check(this.userId, String);
    check(action, String);
    check(recUser, String);
    check(listing, Match.OneOf(String, null) );
    check(linkid, Match.OneOf(String, null) );
    let username = Meteor.users.findOne({ _id: this.userId }).username;

    switch (action) {
      case 'newOffer':
        var type = 'mypost';
        var feedmsg = "<b>" + username + "</b>" + " sent an offer to your post: " + "<b>" + listing + "." + "</b>";
        break;

        case 'changeOffer':
          var type = 'mypost';
          var feedmsg = "<b>" + username + "</b>" + " has changed the offer amount on your post: " + "<b>" + listing + "." + "</b>";
          break;

        case 'removeBuyer':
          var type = null;
          var feedmsg = "<b>" + username + "</b>" + " has declined your offer for: " + "<b>" + listing + "." + "</b>";
          break;

        case 'postFeedback':
          var type = 'profile';
          var feedmsg = "<b>" + username + "</b>" + " posted a feedback about you."
          break;

        case 'changePrice':
          var type = 'listing';
          var feedmsg = "<b>" + username + "</b>" + " has changed the selling price on " + "<b>" + listing + "." + "</b>";
          break;

        case 'updatePost':
          var type = 'listing';
          var feedmsg = "<b>" + username + "</b>" + " has updated details on the post: " + "<b>" + listing + "." + "</b>";
          break;

        case 'soldProduct':
          var type = null;
          var feedmsg = "<b>" + username + "</b>" + " has already sold the item: " + "<b>" + listing + "." + "</b>";
          break;

        case 'removePost':
          var type = null;
          var feedmsg = "<b>" + username + "</b>" + " has removed the post for: " + "<b>" + listing + "." + "</b>";
          break;
        }
        Feeds.insert({
          userID: recUser,
          postDate: new Date(),
          linkID: linkid,
          linkType: type,
          body: feedmsg,
          read: false,
        });
      }
});
