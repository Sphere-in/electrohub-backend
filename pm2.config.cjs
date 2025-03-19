module.exports = {
  apps: [
    {
      name: 'express-server',
      script: 'dist/app.js', // <-- Run the compiled JS file!
      watch: false,
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
