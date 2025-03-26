const { ethers } = require("ethers");
const fs = require("fs");
const readline = require("readline");
const chalkImport = require("chalk");
const chalk = chalkImport.default || chalkImport;

require("dotenv").config();

const NETWORK_RPC = "https://rpc-testnet.haust.app";
const CHAIN_ID = 1523903251;

const CONTRACT_ADDRESSES = {
  nft1: "0x6B3f185C4c9246c52acE736CA23170801D636c8E", // Petri Dish NFT
  nft2: "0x28e50a3632961dA179b2Afca4675714ea22E7BB7", // Nutrition Medium NFT
  nft3: "0xdaF34a049EfAa3cc9ad4635D8A710Fae819aca5c"  // Lab Kit NFT
};

const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

function getTimestamp() {
  return chalk.dim(`[${new Date().toISOString()}]`);
}

function getRandomGasLimit() {
  const min = 190000;
  const max = 220000; 
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomGasPrice() {
  const min = 1;
  const max = 10;
  let randomFloat = Math.random() * (max - min) + min;
  randomFloat = Math.floor(randomFloat * 100) / 100;
  return ethers.parseUnits(randomFloat.toString(), "gwei");
}
async function getPrivateKeys() {
  try {
    const fileStream = fs.createReadStream("key.txt");
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const privateKeys = [];
    for await (const line of rl) {
      const trimmedKey = line.trim();
      if (trimmedKey.length === 64 || trimmedKey.length === 66) {
        privateKeys.push(trimmedKey);
      }
    }
    return privateKeys;
  } catch (error) {
    console.error(chalk.red(`${getTimestamp()} Error reading key.txt:`), error);
    process.exit(1);
  }
}

async function mintNFT(wallet, contractAddress, attempt = 1) {
  try {
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
    console.log(chalk.blue(`${getTimestamp()} Minting NFT from contract ${contractAddress}...`));
    const gasLimit = getRandomGasLimit();
    const gasPrice = getRandomGasPrice();

    const tx = await contract.safeMint({
      gasLimit,
      gasPrice
    });

    console.log(chalk.green(`${getTimestamp()} Transaction sent. Waiting for confirmation...`));
    const receipt = await tx.wait();

    console.log(chalk.green(`${getTimestamp()} ✅ NFT Minted successfully!`));
    console.log(chalk.cyan(`${getTimestamp()} 🔗 Explorer Link: https://explorer-testnet.haust.app/tx/${receipt.hash}`));

    return receipt;
  } catch (error) {
    console.error(chalk.red(`${getTimestamp()} ❌ Error minting NFT:`), error.message);

    if (attempt < 3) {
      console.log(chalk.yellow(`${getTimestamp()} 🔄 Retrying... (Attempt ${attempt + 1})`));
      return await mintNFT(wallet, contractAddress, attempt + 1);
    }
    throw error;
  }
}

async function interactiveNFTMinting() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const nftNames = {
    nft1: "Petri Dish NFT",
    nft2: "Nutrition Medium NFT",
    nft3: "Lab Kit NFT"
  };

  const mintOptions = {};

  for (const [key, name] of Object.entries(nftNames)) {
    await new Promise((resolve) => {
      rl.question(chalk.magenta(`Do you want to mint the ${name}? (y/n): `), (answer) => {
        mintOptions[key] = ["y", "yes"].includes(answer.toLowerCase());
        resolve();
      });
    });
  }

  rl.close();
  return mintOptions;
}

async function main() {
  try {
    const mintOptions = await interactiveNFTMinting();
    const privateKeys = await getPrivateKeys();
    const provider = new ethers.JsonRpcProvider(NETWORK_RPC, CHAIN_ID);
    console.log(chalk.green(`${getTimestamp()} 🔹 Found ${privateKeys.length} private keys.`));
    for (const privateKey of privateKeys) {
      const wallet = new ethers.Wallet(privateKey, provider);
      console.log(chalk.blue(`${getTimestamp()} Processing wallet: ${wallet.address}`));

      for (const [nftKey, contractAddress] of Object.entries(CONTRACT_ADDRESSES)) {
        if (mintOptions[nftKey]) {
          try {
            await mintNFT(wallet, contractAddress);
          } catch (error) {
            console.error(chalk.red(`${getTimestamp()} Failed to mint ${nftKey}:`), error);
          }
        }
      }
    }

    console.log(chalk.green(`${getTimestamp()} 🎉 All transactions processed!`));
  } catch (error) {
    console.error(chalk.red(`${getTimestamp()} Fatal error in main process:`), error);
  }
}
main().catch(console.error);
