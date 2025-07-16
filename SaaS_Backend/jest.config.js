/**
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "./src/**"
    ],
    "collectCoverage": true,
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
 */
module.exports = {
  roots: ['<rootDir>/'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  testPathIgnorePatterns: [
    'src/prisma.service.ts',
    '.*\\.controller.spec\\.ts$',
    '.*\\.controller\\.ts$',
  ],
  coveragePathIgnorePatterns: [
    'src/prisma.service.ts',
    '.*\\.controller.spec\\.ts$',
    '.*\\.controller\\.ts$',
    'src/ability',
    'src/authentication',
    'src/websocket',
    'src/utils',
    'src/user/helper.ts',
    'src/user/userFilter.ts',
    'src/documents/utils.ts',
    'src/organization/helpers/',
  ],
};
