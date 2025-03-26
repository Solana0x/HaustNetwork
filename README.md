# HaustNetwork #Mint V2 BOT

Automated NFT Minitng with Nodejs bot, managing multiple EVM Wallet accounts to safely claim faucet and Mint the NFTs. Perfect for those having multiple Accounts.

![image](https://github.com/user-attachments/assets/f2ade932-6b34-49d9-bf04-dea310c6e6b0)

## Features

- Uses Solvecaptcha API TO CLAIM Faucet
- Uses Proxies To Claim Faucet #Safu
- Allows Mulit threading for faster Minting of Nfts.
- Supports multiple Wallets and Private key
- Comes Along with EVM key gen

## SETPS TO RUN THE CODE -

Before running the script, ensure you have Python and Nodejs installed on your machine. Then, install the necessary Python packages using:

1. ``` git clone https://github.com/Solana0x/HaustNetwork.git ```
2. ``` cd HaustNetwork ```
3. ``` pip install -r requirements.txt ```
4. ``` npm install```
5. Add multiple proxies in the `proxy.txt` file you can add 1000+ proxy !! Formate # `HTTP://username:pass@ip:port`.
6. Generate Private keys `keygen.py` in line `19` base on the choice you can write how many private keys you wanted to generated. // By default value is 1000.
7. To run python file run `python keygen.py`
8. Add the wallet address in the `address.txt file` in order to claim faucet command by `node index.js`. ADD THE Captcha APIS in Line 4 ```const API_KEY = 'Solve_Captcha_API_KEY';```
9. Once all wallets are processed run `mint.js file` in order to mint the NFT command `node mint.js`.
10. While running `mint.js` file you can choose which NFT you wanted to mint !

## Requirements

- Python (install Python By - https://www.python.org/downloads/ [windows/mac]) or Ubuntu Server [`sudo apt install python3`]
- Node js ( install Nodejs By - https://nodejs.org/en/download / [windows/mac]) 
- VPS Server ! You can get Via AWS free Tier or Google Free tier or Gitpod or any online for just ~ 2-5$ per month
- Proxy Server - you can buy DataCenter Proxies to Earn Account Generate


# NstProxy - https://app.nstproxy.com/register?i=SkKXHm
# Solve captcha APIs - [https://solvecaptcha.com?from=479148](https://solvecaptcha.com?from=479148)


## FOR ANY KIND OF HELP CONTACT : ` 0xphatom ` on Discord  https://discord.com/users/979641024215416842

# Socials 

# Telegram - [https://t.me/phantomoalpha](https://t.me/phantomoalpha)
# Discord - [https://discord.gg/pGJSPtp9zz](https://discord.gg/pGJSPtp9zz)
