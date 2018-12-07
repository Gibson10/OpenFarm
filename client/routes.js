import { _meteorAngular } from 'meteor/angular';
import _ from 'underscore';

angular
    .module('salephone')
    .config(config)
    .run(loadspinner)
    .run(backConfirm);

function config($stateProvider, $urlRouterProvider, $ionicConfigProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  
  //Remove text of Header back button.
  $ionicConfigProvider.backButton.previousTitleText(false).text('');
  

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'client/templates/main/menu.html',
    controller: 'MenuCtrl as menu' //client/templates/main/menu.js
  })

  .state('app.shop', {
    cache: false,
    url: '/shop',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/shop/shop.html',
        controller: 'ShopCtrl as vm', //client/templates/shop/shop.js
      }
    }
  })

  .state('app.verify', {
    url: '/shop/verify/:token',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/shop/shop.html',
        controller: 'ShopCtrl as vm', //client/templates/shop/shop.js
      }
    }
  })

  .state('app.listings', {
    cache: true,
    url: '/shop/:productId',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/shop/listings_index.html',
        controller: 'ListingsCtrl as vm' //client/templates/shop/listings_index.js
      }
    }
  })

  .state('app.product', {
    cache: false,
    url: '/shop/products/:listingId',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/product_page/product_buyer.html',
        controller: 'BuyerCtrl as vm' //client/templates/product_page/product_buyer.js
      }
    }
  })

  .state('app.seller', {
    url: '/shop/seller/:profileId',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/users/user_profile.html',
        controller: 'ProfCtrl as vm' //client/templates/users/user_profile.js
      }
    }
  })

  .state('app.myproduct', {
    cache: false,
    url: '/sell/products/:listingId',
    views: {
      'menuContent@app': {
        resolve: {
          user: isAuthorized,
        },
        templateUrl: 'client/templates/product_page/product_seller.html',
        controller: 'SellerCtrl as vm' //client/templates/product_page/product_seller.js
      }
    }
  })

  .state('app.sell', {
    url: '/sell',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/sell/sell.html',
        controller: 'SellCtrl as vm' //client/templates/sell/sell.js
      }
    }
  })

  .state('app.select', {
    cache: false,
    url: '/sell/new_post',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/sell/select.html',
        controller: 'SelectCtrl as vm', //client/templates/sell/select.js
        resolve: {
          user: isAuthorized,
        }
      }
    }
  })

  .state('app.newpost', {
    cache: false,
    url: '/sell/new/:productId',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/sell/new_listing.html',
        controller: 'PostCtrl as vm', //client/templates/sell/new_listing.js
        resolve: {
          user: isAuthorized
        }
      }
    }
  })

  .state('app.editpost', {
    cache: false,
    url: '/sell/edit/:listingId',
    views: {
      'menuContent@app': {
        resolve: {
          user: isAuthorized,
        },
        templateUrl: 'client/templates/sell/edit_listing.html',
        controller: 'EditCtrl as vm' //client/templates/sell/edit_listing.js
      }
    }
  })

  .state('app.myoffers', {
    url: '/myoffers',
    views: {
      'menuContent@app': {
        resolve: {
          user: isAuthorized
        },
        templateUrl: 'client/templates/shop/listings_index.html',
        controller: 'MyOfferCtrl as vm' //client/templates/shop/listings_index.js
      }
    }
  })

  .state('app.chatlist', {
    url: '/messages',
    views: {
      'menuContent@app': {
        resolve: {
          user: isAuthorized
        },
        templateUrl: 'client/templates/messages/chat_list.html',
        controller: 'ChatCtrl as vm' //client/templates/messages/chat_list.js
      }
    }
  })

  .state('app.chat', {
    cache: false,
    url: '/chat/:chatId',
    views: {
      'menuContent@app': {
        resolve: {
          user: isAuthorized
        },
        templateUrl: 'client/templates/messages/chat.html',
        controller: 'MsgCtrl as vm' //client/templates/messages/chat.js
      }
    }
  })

  .state('app.chatinfo', {
    url: '/chat_info/:chatId',
    views: {
      'menuContent@app': {
        resolve: {
          user: isAuthorized
        },
        templateUrl: 'client/templates/messages/chat_details.html',
        controller: 'MsgInfoCtrl as vm' //client/templates/messages/chat_details.js
      }
    }
  })

  .state('app.feeds', {
    url: '/activities',
    views: {
      'menuContent@app': {
        resolve: {
          user: isAuthorized,
          subscribe: function() {
            return Meteor.subscribe('myProfile');
          }
        },
        templateUrl: 'client/templates/main/activity_feed.html',
        controller: 'FeedsCtrl as vm' //client/templates/main/activity_feed.js
      }
    }
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/main/search.html',
        controller: 'SearchCtrl as vm' //client/templates/main/search.js
      }
    }
  })

  .state('app.myprofile', {
    url: '/myprofile/',
    views: {
      'menuContent@app': {
        resolve: {
          user: isAuthorized,
        },
        templateUrl: 'client/templates/users/my_profile.html',
        controller: 'myProfCtrl as vm'  //client/templates/users/my_profile.js
      }
    }
  })

  .state('app.editprofile', {
    cache: false,
    url: '/myprofile/edit/',
    views: {
      'menuContent@app': {
        resolve: {
          user: isAuthorized
        },
        templateUrl: 'client/templates/users/edit_profile.html',
        controller: 'EditProfCtrl as vm'  //client/templates/users/edit_profile.js
      }
    }
  })

  .state('app.login', {
    cache: false,
    url: '/login',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/users/auth/login.html',
        controller: 'LoginCtrl as vm' //client/templates/users/auth/login.js
      }
    }
  })

  .state('app.register', {
    cache: false,
    url: '/register',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/users/auth/register.html',
        controller: 'RegCtrl as vm' //client/templates/users/auth/register.js
      }
    }
  })

  .state('app.forgot', {
    cache: false,
    url: '/reset',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/users/auth/forgot_pwd.html',
        controller: 'ForgotPwdCtrl as vm' //client/templates/users/auth/forgot_pwd.js
      }
    }
  })

  .state('app.reset', {
    cache: false,
    url: '/reset/:token',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/users/auth/reset_pwd.html',
        controller: 'ForgotPwdCtrl as vm' //client/templates/users/auth/reset_pwd.js
      }
    }
  })

  .state('app.account', {
    cache: false,
    url: '/edit/account',
    views: {
      'menuContent@app': {
        templateUrl: 'client/templates/users/auth/change_pwd.html',
        controller: 'AuthCtrl as vm', //client/templates/users/auth/change_pwd.js
        resolve: {
          user: isAuthorized
        }
      }
    }
  })

  $urlRouterProvider.otherwise('/app/shop');

  //Require user to login before going to page, or redirect to Login page.
  function isAuthorized($state, $ionicViewSwitcher, $q) {
    let deferred = $q.defer();

    if (_.isEmpty(Meteor.user())) {
      deferred.reject('AUTH_REQUIRED');
      $ionicViewSwitcher.nextDirection("back");
      $state.go('app.login');
    }
    else {
      deferred.resolve();
    }
    return deferred.promise;
  }
};

//Loading spinner function.
function loadspinner($rootScope, $ionicLoading) {
    $rootScope.$on('loadspinner', function() {
        $ionicLoading.show({
            template: '<ion-spinner class="spinner-light" icon="spiral"></ion-spinner>',
            noBackdrop: true
        })
    });
};

function backConfirm($ionicPlatform, $ionicPopup, $ionicHistory, $state) {
  $ionicPlatform.registerBackButtonAction(function(event) {
    if ( true && $ionicHistory.backView() ) {
      $ionicHistory.goBack();
    }
    else if( true && !$ionicHistory.backView() && $state.is('app.shop') ) {
      ionic.Platform.exitApp(); 
    }
    else if( true && !$ionicHistory.backView() && !$state.is('app.shop') ) {
      $state.go('app.shop');
    }
  }, 100);
};
