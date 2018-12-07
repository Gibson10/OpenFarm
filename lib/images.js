import { Mongo } from 'meteor/mongo';
import { FilesCollection } from 'meteor/ostrio:files';
import Grid from 'gridfs-stream';
import fs from 'fs';

let gfs;
if (Meteor.isServer) {
  const mongo = MongoInternals.NpmModules.mongodb.module; // eslint-disable-line no-undef
  gfs = Grid(Meteor.users.rawDatabase(), mongo);
}

//Image uploads for Listings.
this.Uploads = new FilesCollection({
  collectionName: 'uploads',
  allowClientCode: false,
  //debug: Meteor.isServer && process.env.NODE_ENV === 'development',
  onBeforeUpload(file) {
    if (file.size <= 10485760 && /png|jpg|jpeg|gif/i.test(file.extension)) return true;
    return 'Please upload image, with size equal or less than 10MB';
  },
  onAfterUpload(image) {
    Object.keys(image.versions).forEach(versionName => {
      const metadata = { versionName, imageId: image._id, storedAt: new Date() }; // Optional
      const writeStream = gfs.createWriteStream({ filename: image.name, metadata });

      fs.createReadStream(image.versions[versionName].path).pipe(writeStream);

      writeStream.on('close', Meteor.bindEnvironment(file => {
        const property = `versions.${versionName}.meta.gridFsFileId`;

        this.collection.update(image._id, { $set: { [property]: file._id.toString() } });
        this.unlink(this.collection.findOne(image._id), versionName); // Unlink files from FS
      }));
    });
  },
  interceptDownload(http, image, versionName) {
    const _id = (image.versions[versionName].meta || {}).gridFsFileId;
    if (_id) {
      const readStream = gfs.createReadStream({ _id });
      readStream.on('error', err => { throw err; });
      readStream.pipe(http.response);
    }
    return Boolean(_id);
  },
  onAfterRemove(images) {
    images.forEach(image => {
      Object.keys(image.versions).forEach(versionName => {
        const _id = (image.versions[versionName].meta || {}).gridFsFileId;
        if (_id) gfs.remove({ _id }, err => { if (err) throw err; });
      });
    });
  }
});

if (Meteor.isServer) {
  Uploads.denyClient();
}

//Image uploads of user profile.
this.ProfileImg = new FilesCollection({
  collectionName: 'profileImg',
  allowClientCode: false,
  onBeforeUpload(file) {
    if (file.size <= 2097152 && /png|jpg|jpeg/i.test(file.extension)) return true;
    return 'Please upload image, with size equal or less than 2MB';
  },
  onAfterUpload(image) {
    Object.keys(image.versions).forEach(versionName => {
      const metadata = { versionName, imageId: image._id, storedAt: new Date() }; // Optional
      const writeStream = gfs.createWriteStream({ filename: image.name, metadata });

      fs.createReadStream(image.versions[versionName].path).pipe(writeStream);

      writeStream.on('close', Meteor.bindEnvironment(file => {
        const property = `versions.${versionName}.meta.gridFsFileId`;

        this.collection.update(image._id, { $set: { [property]: file._id.toString() } });
        this.unlink(this.collection.findOne(image._id), versionName); // Unlink files from FS
      }));
    });
  },
  interceptDownload(http, image, versionName) {
    const _id = (image.versions[versionName].meta || {}).gridFsFileId;
    if (_id) {
      const readStream = gfs.createReadStream({ _id });
      readStream.on('error', err => { throw err; });
      readStream.pipe(http.response);
    }
    return Boolean(_id);
  },
  onAfterRemove(images) {
    images.forEach(image => {
      Object.keys(image.versions).forEach(versionName => {
        const _id = (image.versions[versionName].meta || {}).gridFsFileId;
        if (_id) gfs.remove({ _id }, err => { if (err) throw err; });
      });
    });
  }
});

if (Meteor.isServer) {
  ProfileImg.denyClient();
}
