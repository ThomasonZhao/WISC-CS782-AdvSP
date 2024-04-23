// worker.js
const { parentPort } = require('worker_threads');

// Function to generate a random string
function generateRandomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }).map(() => charset[Math.floor(Math.random() * charset.length)]).join('');
}

function register(username, password) {
  // Your register function code here
  console.log(`Worker ${process.env.WORKER_ID} registered user ${username} with password ${password}`);
}

function login(username, password) {
  // Your login function code here
  console.log(`Worker ${process.env.WORKER_ID} logged in user ${username} with password ${password}`);
}

parentPort.on('message', (event) => {
  const { type, payload } = event;
  if (type === 'start') {
    const { rounds, workerIndex } = payload;
    for (let i = 0; i < rounds; i++) {
      const username = `user_${workerIndex}_${i}`;
      const password = generateRandomString(12);
      register(username, password);
      login(username, password);
    }
    parentPort.postMessage({ type: 'finished' });
  }
});