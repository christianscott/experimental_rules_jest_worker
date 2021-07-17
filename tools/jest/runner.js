// @ts-check
const worker = require('@bazel/worker');
const fs = require('fs');
const { createTestScheduler, TestWatcher, SearchSource } = require('jest');
const { readConfigs } = require('jest-config');
const { default: Runtime } = require('jest-runtime');

async function run() {
  const runAsWorker = worker.runAsWorker(process.argv);

  const { configs, globalConfig } = await readConfigs(
    {
      $0: '',
      _: process.argv.slice(2),
      config: JSON.stringify({
        reporters: [],
      }), // dunno
      color: true,
      cache: false,
      runInBand: true,
      runTestsByPath: true,
      testMatch: ['**/tests/**/*.test.{js,ts,tsx}'],
      modulePathIgnorePatterns: ['/node_modules/', '/third_party/'],
      watch: false,
    },
    [process.cwd()]
  );

  const { contexts } = await buildContexts(configs);

  const searchSources = contexts.map((ctx) => new SearchSource(ctx));

  const startRun = () => {
    throw new Error('startRun: not implemented');
  };

  if (runAsWorker) {
    worker.runWorkerLoop(run);
  } else {
    // todo: args
    runTests(globalConfig.nonFlagArgs);
  }

  async function run(args) {
    const [testResultsFile, ...tests] = args;
    try {
      const results = await runTests(tests);
      fs.writeFileSync(testResultsFile, JSON.stringify(results));
      // "true" here means that we ran the tests to completion - *not*
      // that all of the tests passed.
      return true;
    } catch (error) {
      worker.log(error);
      return false;
    }
  }

  async function runTests(tests) {
    const allTests = [];
    for (const searchSource of searchSources) {
      allTests.push(...searchSource.findTestsByPaths(tests).tests);
    }

    const scheduler = await createTestScheduler(
      globalConfig,
      { startRun },
      { firstRun: true, previousSuccess: false }
    );

    return scheduler.scheduleTests(
      allTests,
      new TestWatcher({ isWatchMode: false })
    );
  }
}

async function buildContexts(configs) {
  const contexts = await Promise.all(
    configs.map(async (config) => {
      // createDirectory(config.cacheDirectory);
      const hasteMapInstance = Runtime.createHasteMap(config, {
        maxWorkers: 1,
        resetCache: !config.cache,
        watch: false,
        watchman: false,
      });
      return createContext(config, await hasteMapInstance.build());
    })
  );

  return { contexts };
}

function createContext(config, { hasteFS, moduleMap }) {
  return {
    config,
    hasteFS,
    moduleMap,
    resolver: Runtime.createResolver(config, moduleMap),
  };
}

run();
