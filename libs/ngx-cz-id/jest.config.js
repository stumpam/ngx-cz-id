module.exports = {
  name: 'ngx-cz-id',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/ngx-cz-id',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
