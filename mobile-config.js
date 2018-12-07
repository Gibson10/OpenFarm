App.accessRule( "blob:*" );

App.info({
  id: 'com.agri.kenya',
  name: 'Open Farm Kenya',
  description: 'Social commerce app.',
  author: 'TapGadget',
  email: 'njine10@gmail.com',
  website: 'thebigzoo.co.ke',
  version: '3.8'
});

App.configurePlugin('phonegap-plugin-push', {
  SENDER_ID: 'xxx'
});

App.setPreference("AutoHideSplashScreen", "false");
App.setPreference("ShowSplashScreenSpinner", "false");

App.icons({
  'android_mdpi': 'mobile/icons/android-icon-72x72.png', //(48x48)
  'android_hdpi': 'mobile/icons/android-icon-96x96.png', //(72x72)
  'android_xhdpi': 'mobile/icons/android-icon-144x144.png', //(96x96)
  'android_xxhdpi': 'mobile/icons/android-icon-192x192.png', //(144x144)
  'android_xxxhdpi': 'mobile/icons/android-icon-192x192.png' //(192x192)
  //'iphone_2x': '', //(120x120)
  //'iphone_3x': '', //(180x180)
  //'ipad': '', //(76x76)
  //'ipad_2x': '', //(152x152)
  //'ipad_pro': '', //(167x167)
  //'ios_settings': '', //(29x29)
  //'ios_settings_2x': '', //(58x58)
  //'ios_settings_3x': '', //(87x87)
  //'ios_spotlight': '', //(40x40)
  //'ios_spotlight_2x': '', //(80x80)
});

App.launchScreens({
  'android_mdpi_portrait': 'mobile/splash/officialogo.png', //(320x470)
  'android_mdpi_landscape': 'mobile/splash/officialogo.png', //(470x320)
  'android_hdpi_portrait': 'mobile/splash/officialogo.png', //(480x640)
  'android_hdpi_landscape': 'mobile/splash/officialogo.png', //(640x480)
  'android_xhdpi_portrait': 'mobile/splash/officialogo.png', //(720x960)
  'android_xhdpi_landscape': 'mobile/splash/officialogo.png', //(960x720)
  'android_xxhdpi_portrait': 'mobile/splash/officialogo.png', //(1080x1440)
  'android_xxhdpi_landscape': 'mobile/splash/officialogo.png' //(1440x1080)
  //'iphone_2x': '', //(640x960)
  //'iphone5': '', //(640x1136)
  //'iphone6': '', //(750x1334)
  //'iphone6p_portrait': '', //(1242x2208)
  //'iphone6p_landscape': '', //(2208x1242)
  //'ipad_portrait': '', //(768x1024)
  //'ipad_portrait_2x': '', //(1536x2048)
  //'ipad_landscape': '', //(1024x768)
  //'ipad_landscape_2x': '', //(2048x1536)
});

App.accessRule( "https://google.com" );
App.accessRule( "https://facebook.com" );
App.accessRule( "https://geocoder.api.here.com" );
App.accessRule( "https://reverse.geocoder.api.here.com" );
