module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
    ],
    overrides: [
        {
            // Only apply LWC plugin to LWC source files — not mocks or tests
            test: /force-app\/main\/default\/lwc\/(?!.*__tests__).*\.js$/,
            plugins: ['@lwc/babel-plugin-component'],
        },
    ],
};
