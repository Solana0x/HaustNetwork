const fs = require('fs/promises');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const API_KEY = 'Solve_Captcha_API_KEY';
const SITE_KEY = 'da2c2c8e-4150-444a-8cfc-2b12635c8846';
const SITE_URL = 'https://faucet.haust.app';
const FAUCET_API_URL = 'https://faucet.haust.app/api/claim';

const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const THREAD_COUNT = 3;
const PROXY_FILE = 'proxy.txt';
const ADDRESS_FILE = 'address.txt';
async function loadProxies(filename = PROXY_FILE) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return data
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);
  } catch (err) {
    console.error(`Error reading proxies file: ${err.message}`);
    return [];
  }
}
async function readAddresses(filename = ADDRESS_FILE) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return data
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);
  } catch (err) {
    console.error(`Error reading addresses file: ${err.message}`);
    return [];
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function solveHCaptchaWithRetry(retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const submitUrl = 'https://api.solvecaptcha.com/in.php';
      const payload = new URLSearchParams({
        key: API_KEY,
        method: 'hcaptcha',
        sitekey: SITE_KEY,
        pageurl: SITE_URL,
        json: '1',
      });

      const submitRes = await axios.post(submitUrl, payload.toString(), {
        timeout: REQUEST_TIMEOUT,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!submitRes.data || submitRes.data.status !== 1) {
        throw new Error(
          `API Error (submit captcha): ${submitRes.data?.request || 'Unknown error'}`
        );
      }

      const captchaId = submitRes.data.request;
      console.log(`Captcha task submitted. ID: ${captchaId}`);
      const retrieveUrl = 'https://api.solvecaptcha.com/res.php';
      const startTime = Date.now();
      while (Date.now() - startTime < 2 * 60 * 1000) {
        await sleep(0);
        const pollParams = new URLSearchParams({
          key: API_KEY,
          action: 'get',
          id: captchaId,
          json: '1',
        });

        const pollRes = await axios.get(`${retrieveUrl}?${pollParams.toString()}`, {
          timeout: REQUEST_TIMEOUT,
        });
        if (!pollRes.data) {
          console.log(`Invalid JSON response: ${pollRes}`);
          continue;
        }

        if (pollRes.data.status === 1) {
          return {
            token: pollRes.data.request,
            user_agent: pollRes.data.useragent || '',
          };
        } else if (
          String(pollRes.data.request || '').includes('CAPCHA_NOT_READY')
        ) {
          continue;
        } else {
          throw new Error(
            `API Error (polling captcha): ${pollRes.data.request || 'Unknown error'}`
          );
        }
      }
      throw new Error('Timeout waiting for captcha solution');
    } catch (err) {
      if (attempt < retries) {
        console.log(`Attempt ${attempt} failed, retrying... Error: ${err.message}`);
        await sleep(100 * attempt);
      } else {
        throw new Error(`Captcha solving failed after ${retries} attempts: ${err.message}`);
      }
    }
  }
}

async function claimFaucetWithRetry(address, captchaData, proxy, retries = MAX_RETRIES) {
    const payload = { address };
    const headers = {
      accept: '*/*',
      'content-type': 'application/json',
      'h-captcha-response': captchaData.token,
      'User-Agent': captchaData.user_agent || '',
    };
  
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        let agent = undefined;
        if (proxy) {
          agent = new HttpsProxyAgent(proxy); 
        }
        
        const response = await axios.post(FAUCET_API_URL, payload, {
          headers,
          timeout: REQUEST_TIMEOUT,
          httpAgent: agent,
          httpsAgent: agent,
        });
        return response.data;
  
      } catch (err) {
        console.log(`Attempt ${attempt} failed, retrying faucet claim... Error: ${err.message}`);
        if (attempt < retries) {
          await sleep(5000 * attempt);
        } else {
          throw new Error(`Faucet claim failed after ${retries} attempts: ${err.message}`);
        }
      }
    }
  }
async function processAddress(address, getNextProxy) {
  console.log(`\nProcessing address: ${address}`);
  try {
    console.log('Solving hCaptcha...');
    const captchaData = await solveHCaptchaWithRetry();
    console.log(`Successfully solved hCaptcha. Token: ${captchaData.token.slice(0, 30)}...`);
    const proxy = getNextProxy();
    console.log(`Claiming faucet using proxy: ${proxy ? proxy.slice(0, 20) + '...' : 'None'}`);
    const result = await claimFaucetWithRetry(address, captchaData, proxy);
    console.log('Claim result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`Error processing address ${address}: ${err.message}`);
  }
}
async function main() {
  const addresses = await readAddresses();
  const proxies = await loadProxies();

  if (addresses.length === 0) {
    console.log('No addresses found in address.txt');
    return;
  }

  if (proxies.length === 0) {
    console.log('Warning: No proxies found in proxy.txt - will make direct faucet claims.');
    proxies.push(null);
  }
  let proxyIndex = 0;
  function getNextProxy() {
    const proxy = proxies[proxyIndex % proxies.length];
    proxyIndex += 1;
    return proxy;
  }
  const totalAddresses = addresses.length;
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < totalAddresses) {
      const addrIndex = currentIndex++;
      const address = addresses[addrIndex];
      await processAddress(address, getNextProxy);
      await sleep(1);
    }
  }
  const workers = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
}

main().catch((err) => {
  console.error(`Unhandled error in main: ${err.message}`);
});
