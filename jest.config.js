const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  projects: [
    ...getJestProjects(),
    '<rootDir>/apps/demo',
    '<rootDir>/libs/ngx-cz-id',
  ],
};
