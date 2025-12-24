module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "services/**/*.js",
    "config/**/*.js",
    "!**/node_modules/**"
  ],
  coverageDirectory: "coverage",
  verbose: true
};




