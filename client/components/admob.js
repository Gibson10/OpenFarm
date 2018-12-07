import { Meteor } from 'meteor/meteor';

Meteor.startup(function () {
  if (Meteor.isCordova) {
    if (AdMob && Meteor.settings.public.admob.adId) {
      AdMob.createBanner( {
        adSize: 'SMART_BANNER',
        adId: Meteor.settings.public.admob.adId,
        position: AdMob.AD_POSITION.BOTTOM_CENTER,
        isTesting: true,
        autoShow: false
      });
    } else {
      return;
    }
  } else {
    return;
  }
});
