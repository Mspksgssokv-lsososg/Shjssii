const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
  config: {
    name: "grildp",
    version: "1.0",
    author: "SK-SIDDIK-KHAN",
    countDown: 10,
    role: 0,
    category: "user",
  },

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply({
      body: "Loading Girls Pic... Please wait ⏰",
    });

    const links = [
      "https://i.imgur.com/GWvWrOU.jpg","https://i.imgur.com/HlsXDDh.jpg","https://i.imgur.com/IAK2mhm.jpg","https://i.imgur.com/EXsKLRr.jpg","https://i.imgur.com/48lKPK9.jpg","https://i.imgur.com/ylJhQiH.jpg","https://i.imgur.com/aGalyKj.jpg","https://i.imgur.com/EE8hhkl.jpg","https://i.imgur.com/fz4sU7e.jpg","https://i.imgur.com/ucHzYiJ.jpg","https://i.imgur.com/LX1iD04.jpg","https://i.imgur.com/Vr0x1nz.jpg","https://i.imgur.com/voUwxl9.jpg","https://i.imgur.com/8aJed5B.jpg","https://i.imgur.com/GCoJji2.jpg","https://i.imgur.com/3YzAYEm.jpg","https://i.imgur.com/g5o6cgR.jpg","https://i.imgur.com/mojVpEc.jpg","https://i.imgur.com/DWYoD7c.jpg","https://i.imgur.com/kCpgGjm.jpg","https://i.imgur.com/1ndfYuz.jpg","https://i.imgur.com/nzh5pjU.jpg","https://i.imgur.com/Jcdlar4.jpg","https://i.imgur.com/3SFW45P.jpg","https://i.imgur.com/fLXfa8i.jpg","https://i.imgur.com/SdeIlFK.jpg","https://i.imgur.com/Qooddnp.jpg","https://i.imgur.com/vVMjMx6.jpg","https://i.imgur.com/PRQSD8f.jpg","https://i.imgur.com/SPP99U6.jpg","https://i.imgur.com/HUPpY8i.jpg","https://i.imgur.com/OKqotRw.jpg","https://i.imgur.com/5EVpoUc.jpg","https://i.imgur.com/hI9hvUb.jpg","https://i.imgur.com/tHsUF0Z.jpg","https://i.imgur.com/GllqyhW.jpg","https://i.imgur.com/HIe8w87.jpg","https://i.imgur.com/j2o6kNE.jpg","https://i.imgur.com/rfWnE0b.jpg","https://i.imgur.com/Pn4Ss7P.jpg","https://i.imgur.com/ZV2YKOC.jpg","https://i.imgur.com/vd5mp5W.jpg","https://i.imgur.com/SWauVPx.jpg","https://i.imgur.com/BjFbpH6.jpg","https://i.imgur.com/9T7OfNl.jpg","https://i.imgur.com/Y1Fk2sC.jpg","https://i.imgur.com/rhpuHvM.jpg","https://i.imgur.com/Oiqesz0.jpg","https://i.imgur.com/f3z1yxd.jpg","https://i.imgur.com/BxH5NYW.jpg","https://i.imgur.com/Sc5hSaH.jpg","https://i.imgur.com/HSwfPgj.jpg","https://i.imgur.com/TU4ejfq.jpg","https://i.imgur.com/cQ6SVmx.jpg"
    ];

    const imgURL = links[Math.floor(Math.random() * links.length)];
    const fileName = path.basename(imgURL);
    const downloadDir = path.join(__dirname, "cache", "grildp");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const filePath = path.join(downloadDir, fileName);

    try {
      if (!fs.existsSync(filePath)) {
        await downloadFile(filePath, imgURL);
      }

      await message.reply({
        body: '[ 𝐌𝐀𝐃𝐄 𝐁𝐘 𝐒𝐊 𝐒𝐈𝐃𝐃𝐈𝐊 ]',
        attachment: fs.createReadStream(filePath),
      });
    } catch (error) {
      console.error("Image fetch failed:", error.message);
      await message.reply("Image load failed (rate limited or error). Please try again later.");
    }

    setTimeout(() => {
      api.unsendMessage(loadingMessage.messageID);
    }, 1500);
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
