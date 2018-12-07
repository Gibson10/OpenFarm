/*
var knox, bound, client, Request, cfdomain, Collections = {};

if (Meteor.isServer) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

  knox    = Npm.require('knox');
  Request = Npm.require('request');
  bound = Meteor.bindEnvironment(function(callback) {
    return callback();
  });
  cfdomain = Meteor.settings.s3.domain; // <-- Your S3 bucket domain, or CloudFront domain
  client = knox.createClient({
    key: Meteor.settings.s3.key,
    secret: Meteor.settings.s3.secret,
    bucket: Meteor.settings.s3.bucket,
    region: Meteor.settings.s3.region
  });
}

this.Uploads = new FilesCollection({
  debug: false,
  throttle: false,
  storagePath: 'assets/app/uploads/uploadedFiles',
  collectionName: 'uploads',
  allowClientCode: false,
  onAfterUpload: function(fileRef) {
    var self = this;
    _.each(fileRef.versions, function(vRef, version) {

      let sourcePath = 'assets/app/uploads/uploadedFiles/' + fileRef._id + '.' + fileRef.extension;
      var filePath = "files/" + (Random.id()) + "-" + version + "." + fileRef.extension;
      client.putFile(sourcePath, filePath, function(error, res) {
        bound(function() {
          var upd;
          if (error) {
            console.error(error);
          } else {
            upd = {
              $set: {}
            };
            upd['$set']["versions." + version + ".meta.pipeFrom"] = cfdomain + '/' + filePath;
            upd['$set']["versions." + version + ".meta.pipePath"] = filePath;
            self.collection.update({
              _id: fileRef._id
            }, upd, function(error) {
              if (error) {
                console.error(error);
              } else {
                self.unlink(self.collection.findOne(fileRef._id), version);
              }
            });
          }
        });
      });
    });
  },
  interceptDownload: function(http, fileRef, version) {
    var path, ref, ref1, ref2;
    path = (ref = fileRef.versions) != null ? (ref1 = ref[version]) != null ? (ref2 = ref1.meta) != null ? ref2.pipeFrom : void 0 : void 0 : void 0;
    if (path) {
      Request({
        url: path,
        headers: _.pick(http.request.headers, 'range', 'accept-language', 'accept', 'cache-control', 'pragma', 'connection', 'upgrade-insecure-requests', 'user-agent')
      }).pipe(http.response);
      return true;
    } else {
      return false;
    }
  }
});

if (Meteor.isServer) {
  var _origRemove = this.Uploads.remove;

  this.Uploads.remove = function(search) {
    var cursor = this.collection.find(search);
    cursor.forEach(function(fileRef) {
      _.each(fileRef.versions, function(vRef) {
        var ref;
        if (vRef != null ? (ref = vRef.meta) != null ? ref.pipePath : void 0 : void 0) {
          client.deleteFile(vRef.meta.pipePath, function(error) {
            bound(function() {
              if (error) {
                console.error(error);
              }
            });
          });
        }
      });
    });
    _origRemove.call(this, search);
  };
}

this.ProfileImg = new FilesCollection({
  debug: false,
  throttle: false,
  storagePath: 'assets/app/uploads/uploadedFiles',
  collectionName: 'profileImg',
  allowClientCode: false,
  onAfterUpload: function(fileRef) {
    var self = this;
    _.each(fileRef.versions, function(vRef, version) {
      
      let sourcePath = 'assets/app/uploads/uploadedFiles/' + fileRef._id + '.' + fileRef.extension;
      var filePath = "files/" + (Random.id()) + "-" + version + "." + fileRef.extension;

      client.putFile(sourcePath, filePath, function(error, res) {
        bound(function() {
          var upd;
          if (error) {
            console.error(error);
          } else {
            upd = {
              $set: {}
            };
            upd['$set']["versions." + version + ".meta.pipeFrom"] = cfdomain + '/' + filePath;
            upd['$set']["versions." + version + ".meta.pipePath"] = filePath;
            self.collection.update({
              _id: fileRef._id
            }, upd, function(error) {
              if (error) {
                console.error(error);
              } else {
                self.unlink(self.collection.findOne(fileRef._id), version);
              }
            });
          }
        });
      });
    });
  },
  interceptDownload: function(http, fileRef, version) {
    var path, ref, ref1, ref2;
    path = (ref = fileRef.versions) != null ? (ref1 = ref[version]) != null ? (ref2 = ref1.meta) != null ? ref2.pipeFrom : void 0 : void 0 : void 0;
    if (path) {
      Request({
        url: path,
        headers: _.pick(http.request.headers, 'range', 'accept-language', 'accept', 'cache-control', 'pragma', 'connection', 'upgrade-insecure-requests', 'user-agent')
      }).pipe(http.response);
      return true;
    } else {
      return false;
    }
  }
});

if (Meteor.isServer) {
  var _origRemove = this.ProfileImg.remove;

  this.ProfileImg.remove = function(search) {
    var cursor = this.collection.find(search);
    cursor.forEach(function(fileRef) {
      _.each(fileRef.versions, function(vRef) {
        var ref;
        if (vRef != null ? (ref = vRef.meta) != null ? ref.pipePath : void 0 : void 0) {
          client.deleteFile(vRef.meta.pipePath, function(error) {
            bound(function() {
              if (error) {
                console.error(error);
              }
            });
          });
        }
      });
    });
    _origRemove.call(this, search);
  };
}
*/
