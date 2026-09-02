const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
  config: {
    name: "messi",
    aliases: ["messipic", "lm10"],
    version: "1.0",
    author: "SK-SIDDIK-KHAN",
    countDown: 5,
    role: 0,
    category: "user",
  },

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply({
      body: "Loading Messi Pic... Please wait ⏰",
    });

    const links = [
      "https://i.imgur.com/ahKcoO3.jpg",

"https://i.imgur.com/Vsf4rM3.jpg",

"https://i.imgur.com/ximEjww.jpg",

"https://i.imgur.com/ukYhm0D.jpg",

"https://i.imgur.com/Poice6v.jpg",

"https://i.imgur.com/5yMvy5Z.jpg",

"https://i.imgur.com/ndyprcd.jpg",

"https://i.imgur.com/Pm2gC6I.jpg",

"https://i.imgur.com/wxxHuAG.jpg",

"https://i.imgur.com/GwOCq59.jpg",

 "https://i.imgur.com/oM0jc4i.jpg",

"https://i.imgur.com/dJ0OUef.jpg",

"https://i.imgur.com/iurRGPT.jpg",

"https://i.imgur.com/jogjche.jpg",

"https://i.imgur.com/TiyhKjG.jpg",

"https://i.imgur.com/AwlBM23.jpg",

"https://i.imgur.com/9OLSXZD.jpg",

"https://i.imgur.com/itscmiy.jpg",

"https://i.imgur.com/FsnCelU.jpg",

"https://i.imgur.com/c7BCwDF.jpg",

"https://i.imgur.com/3cnR6xh.jpg",

"https://i.imgur.com/TZqepnU.jpg",

"https://i.imgur.com/kYxEPrD.jpg",

"https://i.imgur.com/9ZjD5nX.jpg",

"https://i.imgur.com/YWyI4hP.jpg"
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
        body: '[ Messi Profile For You ]',
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
