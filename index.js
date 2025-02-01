const fs = require('fs');
const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxies = fs.readFileSync('proxy.txt', 'utf8').split('\n').map(p => p.trim()).filter(p => p);
const addresses = fs.readFileSync('address.txt', 'utf8').split('\n').map(a => a.trim()).filter(a => a);

async function sendRequest(proxy, address) {
    try {
        const agent = new HttpsProxyAgent(proxy);

        const response = await fetch("https://faucet.haust.app/api/claim", {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "Referer": "https://faucet.haust.app/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            body: JSON.stringify({ address }),
            agent
        });
        const responseText = await response.text();

        console.log(`✅ Proxy: ${proxy} | Address: ${address} | Response:\n`, responseText);
        try {
            const jsonData = JSON.parse(responseText);
            console.log(`Parsed JSON:`, jsonData);
        } catch (jsonError) {
            console.warn(`⚠️ Response is not JSON. Raw response received.`);
        }
    } catch (error) {
        console.error(`❌ Error with proxy ${proxy} for address ${address}:`, error.message);
    }
}

async function processRequests() {
    for (let i = 0; i < addresses.length; i++) {
        const proxy = proxies[i % proxies.length];
        const address = addresses[i];
        await sendRequest(proxy, address);
        await new Promise(resolve => setTimeout(resolve, 4000));
    }
}

processRequests();
