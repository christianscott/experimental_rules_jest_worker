const fs = require('fs');

const resultsJsonFile = process.argv[2];
const results = JSON.parse(fs.readFileSync(resultsJsonFile, 'utf8'));

for (const result of results.testResults) {
  if (result.failureMessage) {
    console.error(result.failureMessage);
  }
}

process.exitCode = results.success ? 0 : 1;
