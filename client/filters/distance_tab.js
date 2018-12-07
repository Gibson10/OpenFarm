import { _meteorAngular } from 'meteor/angular';

angular
  .module('salephone')
  .filter('distanceTab', distanceTab);

function distanceTab () {
  return function (limit) {
    if (!limit) return 'No Limit';

    if ( limit < 1 ) {
      return (limit * 1000).toFixed(0) + ' m';
    }
    else if ( limit > 999 ) {
      return limit.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' km';
    }
    else {
      return limit.toFixed(0) + ' km';
    }
  };
}
