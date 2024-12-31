module.exports = {
    env: {
      node: true,
      jest: true,
    },
    overrides: [
      {
        files: ['tests/**/*.js'], // Apply to test files only
        env: {
            node:true,
          jest: true, // Recognize Jest globals
        },
        rules: {
          // Add or override specific rules here
        },
      },
    ],
  };
  