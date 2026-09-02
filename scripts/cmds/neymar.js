const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
  config: {
    name: "neymar",
    aliases: ["neymarpic", "neymarphoto"],
    version: "1.0",
    author: "SK-SIDDIK-KHAN",
    countDown: 5,
    role: 0,
    category: "user",
  },

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply({
      body: "Loading Neymar Pic... Please wait ⏰",
    });

    const links = [
      "https://i.imgur.com/arWjsNg.jpg",

"https://i.imgur.com/uJYvMR0.jpg",

"https://i.imgur.com/A3MktQ4.jpg",

"https://i.imgur.com/wV8YHHp.jpg",

"https://i.imgur.com/14sAFjM.jpg",

"https://i.imgur.com/EeAi2G6.jpg",

"https://i.imgur.com/fUZbzhJ.jpg",

"https://i.imgur.com/bUjGSCX.jpg",

"https://i.imgur.com/4KZvLbO.jpg",

"https://i.imgur.com/gBEAsYZ.jpg",

"https://i.imgur.com/baKOat0.jpg",

"https://i.imgur.com/4Z0ERpD.jpg",

"https://i.imgur.com/h2ReDUe.jpg",

"https://i.imgur.com/KQPalvi.jpg",

"https://i.imgur.com/VRALDic.jpg",

"https://i.imgur.com/Z3qGkZa.jpg",

"https://i.imgur.com/etyPi7B.jpg",

"https://i.imgur.com/tMxLEwl.jpg",

"https://i.imgur.com/OwEdlZo.jpg",

"https://i.imgur.com/UHAo39t.jpg",

"https://i.imgur.com/aV4EVT9.jpg",

"https://i.imgur.com/zdC8yiG.jpg",

"https://i.imgur.com/JI7tjsr.jpg",

"https://i.imgur.com/fFuPCrM.jpg",

"https://i.imgur.com/XIaAXju.jpg",

"https://i.imgur.com/yyIJwPH.jpg",

"https://i.imgur.com/MyGcsJM.jpg",

"https://i.imgur.com/UXjh4R1.jpg",

"https://i.imgur.com/QGrvMZL.jpg"
    ];

    const imgURL = links[Math.floor(Math.random() * links.length)];
    const fileName = path.basename(imgURL);
    const downloadDir = path.join(__dirname, "cache", "1dp");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const filePath = path.join(downloadDir, fileName);

    try {
      if (!fs.existsSync(filePath)) {
        await downloadFile(filePath, imgURL);
      }

      await message.reply({
        body: '[ Neymar Profile For You ]',
        attachment: fs.createReadStream(filePath),
      });
    } catch (error) {
      console.error("Image fetch failed:", error.message);
      await message.reply("Image load failed (rate limited or error). Please try again later.");
    }

    setTimeout(() => {
      api.unsendMessage(loadingMessage.messageID);
    }, 700);
  },
};

async function downloadFile(filePath, url) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}
