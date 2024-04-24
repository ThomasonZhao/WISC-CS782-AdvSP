import { Worker } from "worker_threads";

const numThreads = 16; // Number of worker threads to create
const numRounds = 10; // Number of rounds per worker
// const protocol = "BASIC"; // Protocol to use for registration
// const protocol = "SRP"; // Protocol to use for registration
const protocol = "OPAQUE"; // Protocol to use for registration

// Function to create a worker thread
function createWorker(index) {
  const worker = new Worker("./worker.js", {
    workerData: {
      workerIndex: index,
      numRounds,
      protocol,
    },
  });
  return worker;
}

// Function to perform the performance test
async function runPerformanceTest() {
  const startTime = performance.now();
  const workers = Array.from({ length: numThreads }, (_, index) => createWorker(index));

  // Start the workers and wait for them to finish
  const workerPromises = workers.map((worker) => {
    return new Promise((resolve) => {
      worker.on("message", (event) => {
        if (event.type === "finished") {
          resolve();
        }
      });
      worker.postMessage({ type: "start" });
    });
  });

  await Promise.all(workerPromises);
  const endTime = performance.now();
  console.log(`${protocol} performance test completed in ${(endTime - startTime) / 1000} seconds.`)
  process.exit();
}

runPerformanceTest();