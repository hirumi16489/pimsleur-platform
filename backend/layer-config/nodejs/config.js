module.exports = {
  dev: { UPLOAD_BUCKET_NAME: 'pimsleur-platform-user-uploads', DEBUG: true },
  prod: { UPLOAD_BUCKET_NAME: 'prod-pimsleur-platform-user-uploads', DEBUG: false }
};