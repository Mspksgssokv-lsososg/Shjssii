const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
  config: {
    name: "cr7",
    version: "1.0",
    author: "SK-SIDDIK-KHAN",
    countDown: 5,
    role: 0,
    category: "user",
  },

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply({
      body: "Loading Cr7 Pic... Please Wait ⏰",
    });

    const links = [
      "https://i.imgur.com/gwAuLMT.jpg",

"https://i.imgur.com/MuuhaJ4.jpg",

"https://i.imgur.com/6t0R8fs.jpg",

"https://i.imgur.com/7RTC4W5.jpg",

"https://i.imgur.com/VTi2dTP.jpg",

"https://i.imgur.com/gdXJaK9.jpg",

"https://i.imgur.com/VqZp7IU.jpg",

"https://i.imgur.com/9pio8Lb.jpg",

"https://i.imgur.com/iw714Ym.jpg",

"https://i.imgur.com/zFbcrjs.jpg",

"https://i.imgur.com/e0td0K9.jpg",

"https://i.imgur.com/gsJWOmA.jpg",

"https://i.imgur.com/lU8CaT0.jpg",

"https://i.imgur.com/mmZXEYl.jpg",

"https://i.imgur.com/d2Ot9pW.jpg",

"https://i.imgur.com/iJ1ZGwZ.jpg",

"https://i.imgur.com/isqQhNQ.jpg",

"https://i.imgur.com/GoKEy4g.jpg",

"https://i.imgur.com/TjxTUsl.jpg",

"https://i.imgur.com/VwPPL03.jpg",

"https://i.imgur.com/45zAhI7.jpg",

"https://i.imgur.com/n3agkNi.jpg",

"https://i.imgur.com/F2mynhI.jpg",

"https://i.imgur.com/XekHaDO.jpg"
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
        body: '[ Ronaldo Profile For You ]',
        attachment: fs.createReadStream(filePath),
      });
    } catch (error) {
      console.error("Image fetch failed:", error.message);
      await message.reply("Image load failed (rate limited or error). Please try again later.");
    }

    setTimeout(() => {
      api.unsendMessage(loadingMessage.messageID);
    }, 800);
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
