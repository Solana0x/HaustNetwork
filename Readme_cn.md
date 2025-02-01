# HaustNetwork

使用 Node.js 机器人实现自动化 NFT 铸造，管理多个 EVM 钱包账户，以安全地领取水龙头（faucet）并铸造 NFT。适合拥有多个账户的用户。

![image](https://github.com/user-attachments/assets/4b1c0761-24c4-44a9-8fb7-de2ad3e6b546)

## 功能特点

- 使用代理服务器领取水龙头 #Safu
- 支持多线程，提高 NFT 铸造速度
- 兼容多个钱包及私钥
- 内置 EVM 私钥生成器

## 运行代码的步骤

在运行脚本之前，请确保你的设备已安装 Python 和 Node.js。然后，安装所需的 Python 依赖包：

1. ```git clone https://github.com/Solana0x/HaustNetwork.git```
2. ```cd HaustNetwork```
3. ```pip install -r requirements.txt```
4. ```npm install```
5. 在 `proxy.txt` 文件中添加多个代理，你可以添加 1000+ 代理！格式：`HTTP://username:pass@ip:port`
6. 生成私钥：在 `keygen.py` 文件的第 `19` 行，根据需求设置要生成的私钥数量（默认值为 1000）。
7. 运行以下命令生成私钥：
   ```python keygen.py```
8. 在 `address.txt` 文件中添加钱包地址，然后运行以下命令领取水龙头：
   ```node index.js```
9. 所有钱包处理完成后，运行 `mint.js` 文件铸造 NFT：
   ```node mint.js```

## 运行要求

- **Python**（安装 Python：[点击下载](https://www.python.org/downloads/) [Windows/mac]，或在 Ubuntu 服务器上运行 `sudo apt install python3`）
- **Node.js**（安装 Node.js：[点击下载](https://nodejs.org/en/download) [Windows/mac]）
- **VPS 服务器**（你可以使用 AWS 免费套餐、Google 免费套餐、Gitpod，或任何在线服务器，每月费用约 $2-$5）
- **代理服务器**（你可以购买数据中心代理以创建账户）

### 推荐代理服务商

- **NstProxy** - [注册链接](https://app.nstproxy.com/register?i=SkKXHm)

## 需要帮助？

请联系 `0xphatom`，Discord 用户名：[点击联系](https://discord.com/users/979641024215416842)

## 社交媒体

- **Telegram**：[加入群组](https://t.me/phantomoalpha)
- **Discord**：[加入服务器](https://discord.gg/pGJSPtp9zz)
