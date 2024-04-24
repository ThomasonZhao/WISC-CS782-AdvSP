import { workerData, parentPort } from "worker_threads";
import axios from "axios";
import srp from "secure-remote-password/client.js";
import * as opaque from "@serenity-kit/opaque";

// Function to generate a random string
function generateRandomString(length) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }).map(() => charset[Math.floor(Math.random() * charset.length)]).join("");
}

const serverAddr = "localhost";
const serverPort_BASIC = 8086;
const serverPort_SRP = 8081;
const serverPort_OPAQUE = 8083;

async function register_BASIC(username, password) {
  try {
    const response = await axios.post(`http://${serverAddr}:${serverPort_BASIC}/api/register`, { username, password });
    if (response.status !== 200) {
      console.error(`Worker ${workerData.workerIndex} failed to register user ${username}:`, response.data.message);
    }
  } catch (error) {
    console.error(`Worker ${workerData.workerIndex} BASIC failed to register user ${username}:`, error);
  }
}

async function login_BASIC(username, password) {
  try {
    const response = await axios.post(`http://${serverAddr}:${serverPort_BASIC}/api/login`, { username, password });
    if (response.status !== 200) {
      console.error(`Worker ${workerData.workerIndex} failed to login user ${username}:`, response.data.message);
    }
  } catch (error) {
    console.error(`Worker ${workerData.workerIndex} BASIC failed to login user ${username}:`, error);
  }
}

async function register_SRP(username, password) {
  const salt = srp.generateSalt();
  const privateKey = srp.derivePrivateKey(salt, username, password);
  const verifier = srp.deriveVerifier(privateKey);

  try {
    const response = await axios.post(`http://${serverAddr}:${serverPort_SRP}/api/register`, { username, salt, verifier });
    if (response.status !== 200) {
      console.error(`Worker ${workerData.workerIndex} failed to register user ${username}:`, response.data.message);
    }
  } catch (error) {
    console.error(`Worker ${workerData.workerIndex} SRP failed to register user ${username}:`, error);
  }
}

async function login_SRP(username, password) {
  let salt = 0;
  let serverEphemeral = 0;

  const clientEphemeral = srp.generateEphemeral();

  try {
    const response1 = await axios.post(`http://${serverAddr}:${serverPort_SRP}/api/login/1`, { username });
    if (response1.status !== 200) {
      console.error(`Worker ${workerData.workerIndex} failed to login user ${username}:`, response1.data.message);
      return;
    }

    salt = response1.data.value.salt;
    serverEphemeral = response1.data.value.serverEphemeral;

    const privateKey = srp.derivePrivateKey(salt, username, password);
    const clientSession = srp.deriveSession(clientEphemeral.secret, serverEphemeral, salt, username, privateKey);

    const response2 = await axios.post(`http://${serverAddr}:${serverPort_SRP}/api/login/2`, { username, clientEphemeral: clientEphemeral.public, clientSession: clientSession.proof });
    if (response2.status !== 200) {
      console.error(`Worker ${workerData.workerIndex} failed to login user ${username}:`, response2.data.message);
    }
  } catch (error) {
    console.error(`Worker ${workerData.workerIndex} SRP failed to login user ${username}:`, error);
  }
}

async function register_OPAQUE(username, password) {
  await opaque.ready;
  try {
    const { clientRegistrationState, registrationRequest } = opaque.client.startRegistration({ password });
    const response1 = await axios.post(`http://${serverAddr}:${serverPort_OPAQUE}/api/register/1`, { username, registrationRequest });
    if (response1.status !== 200) {
      console.error(`Worker ${workerData.workerIndex} failed to register user ${username}:`, response1.data.message);
      return;
    }

    const registrationResponse = response1.data.value.registrationResponse;
    const { registrationRecord } = opaque.client.finishRegistration({ clientRegistrationState, registrationResponse, password });

    const response2 = await axios.post(`http://${serverAddr}:${serverPort_OPAQUE}/api/register/2`, { username, registrationRecord });
    if (response2.status !== 200) {
      console.error(`Worker ${workerData.workerIndex} failed to register user ${username}:`, response2.data.message);
    }
  } catch (error) {
    console.error(`Worker ${workerData.workerIndex} OPAQUE failed to register user ${username}:`, error);
  }
}

async function login_OPAQUE(username, password) {
  await opaque.ready;
  try {
    const { clientLoginState, startLoginRequest } = opaque.client.startLogin({ password });
    const response1 = await axios.post(`http://${serverAddr}:${serverPort_OPAQUE}/api/login/1`, { username, startLoginRequest });
    if (response1.status !== 200) {
      console.error(`Worker ${workerData.workerIndex} failed to login user ${username}:`, response1.data.message);
      return;
    }

    const loginResponse = response1.data.value.loginResponse;
    const loginResult = opaque.client.finishLogin({ clientLoginState, loginResponse, password });
    if (!loginResult) {
      console.error(`Worker ${workerData.workerIndex} failed to login user ${username}:`, "Login failed");
      return;
    }

    const { finishLoginRequest } = loginResult;
    const response2 = await axios.post(`http://${serverAddr}:${serverPort_OPAQUE}/api/login/2`, { username, finishLoginRequest });
    if (response2.status !== 200) {
      console.error(`Worker ${workerData.workerIndex} failed to login user ${username}:`, response2.data.message);
    }
  } catch (error) {
    console.error(`Worker ${workerData.workerIndex} OPAQUE failed to login user ${username}:`, error);
  }
}

async function register(username, password, protocol) {
  switch (protocol) {
    case "BASIC":
      await register_BASIC(username, password);
      break;
    case "SRP":
      await register_SRP(username, password);
      break;
    case "OPAQUE":
      await register_OPAQUE(username, password);
      break;
    default:
      console.error(`Unknown protocol: ${protocol}`);
  }
}

async function login(username, password, protocol) {
  switch (protocol) {
    case "BASIC":
      await login_BASIC(username, password);
      break;
    case "SRP":
      await login_SRP(username, password);
      break;
    case "OPAQUE":
      await login_OPAQUE(username, password);
      break;
    default:
      console.error(`Unknown protocol: ${protocol}`);
  }
}

// Listen for messages from the main thread
parentPort.on("message", async (event) => {
  if (event.type === "start") {
    for (let i = 0; i < workerData.numRounds; i++) {
      const username = `user_${workerData.workerIndex}_${i}`;
      const password = generateRandomString(12);
      await register(username, password, workerData.protocol);
      await login(username, password, workerData.protocol);

      if (i % 10 === 0) {
        console.log(`Worker ${workerData.workerIndex} completed ${i} rounds.`);
      }
    }
    parentPort.postMessage({ type: "finished" });
  }
});