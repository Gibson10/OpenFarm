import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'underscore';

Meteor.methods({
  //Upload new feedback, or change feedback if user has already posted a feedback.
  'sendFeedback': function(thisFeedback) {
    check(this.userId, String);
    check(thisFeedback, {
        chatID: String,
        goodRating: Boolean,
        body: Match.Optional(String)
    });
    let chat =  ChatRoom.findOne({
                  $and: [{
                    _id: thisFeedback.chatID
                  },{
                    $or:[{
                      buyer: this.userId
                    },{
                      seller: this.userId
                    }]
                  }]
                });

    if ( chat.buyer != this.userId ) {
      var otherUser = chat.buyer;
    }
    else if ( chat.seller != this.userId ) {
      var otherUser = chat.seller;
    }

    if ( !Feedback.findOne({ postBy: this.userId, user: otherUser }) ) {
    //New Feedback
      let feedback = _.extend(thisFeedback, {
        user: otherUser,
        postBy: this.userId,
        postName: Meteor.users.findOne({ _id: this.userId }).username,
        postDate: new Date(),
      });
      let profile = Profile.findOne({profID: otherUser });
      if (thisFeedback.goodRating === true) {
        Profile.update( { _id: profile._id }, { $inc: { goodRating: 1 } } );
      }
      else if (thisFeedback.goodRating === false)  {
        Profile.update( { _id: profile._id }, { $inc: { badRating: 1 } } );
      }
      Feedback.insert(feedback);
      return;
    }
    else {
    //Change Feedback
      let existFeedback = Feedback.findOne({ postBy: this.userId, user: otherUser });

      if ( existFeedback.goodRating != thisFeedback.goodRating ) {
        let profile = Profile.findOne({ profID: otherUser });

        if (thisFeedback.goodRating === true) {
          Profile.update({ _id: profile._id },{ $inc: { goodRating: 1, badRating: -1 }});
        }
        else if (thisFeedback.goodRating === false) {
          Profile.update({ _id: profile._id },{ $inc: { goodRating: -1, badRating: 1 }});
        }
      }
      let feedback = _.extend(thisFeedback, {
        postDate: new Date(),
      });

      Feedback.update({ _id: existFeedback._id, postBy: this.userId },{ $set: feedback });
      return;
    }
  }
});
