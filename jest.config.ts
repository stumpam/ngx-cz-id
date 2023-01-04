const { getJestProjects } = require('@nrwl/jest');

export default {
  projects: [
    ...getJestProjects(),
    '<rootDir>/apps/demo',
    '<rootDir>/libs/ngx-cz-id',
  ],
};
