// main.js
const { Worker } = require('worker_threads');
const path = require('path');

const numThreads = 10; // Number of worker threads to create
const numRounds = 10; // Number of rounds per worker

// Function to create a worker thread
function createWorker(index) {
  const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
    env: { WORKER_ID: index },
  });
  return worker;
}

// Function to perform the performance test
function runPerformanceTest() {
  const startTime = performance.now();
  const workers = Array.from({ length: numThreads }, (_, index) => createWorker(index));

  // Start the workers and wait for them to finish
  const workerPromises = workers.map((worker, index) => {
    return new Promise((resolve) => {
      worker.on('message', (event) => {
        if (event.type === 'finished') {
          resolve();
        }
      });
      worker.postMessage({ type: 'start', payload: { rounds: numRounds, workerIndex: index } });
    });
  });

  Promise.all(workerPromises).then(() => {
    const endTime = performance.now();
    console.log(`Performance test completed in ${endTime - startTime} milliseconds.`);
    process.exit();
  });
}

runPerformanceTest();