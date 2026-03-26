module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/jest.setup.js'],
    testMatch: ['**/__tests__/**/*.test.js'],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    moduleNameMapper: {
        '^@salesforce/apex/PacmanScoreController\\.saveScore$': '<rootDir>/__mocks__/apex/saveScore.js',
        '^@salesforce/apex/PacmanScoreController\\.getHighScores$': '<rootDir>/__mocks__/apex/getHighScores.js',
    },
    collectCoverageFrom: [
        'force-app/main/default/lwc/**/*.js',
        '!force-app/main/default/lwc/**/__tests__/**',
    ],
};
