const fs = require("fs");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "boxinfo",
    aliases: ["groupinfo"],
    version: "2.2.0",
    author: "Mᴏʜᴀᴍᴍᴀᴅ Aᴋᴀsʜ",
    role: 1,
    shortDescription: "Group info",
    category: "box chat",
    guide: {
      en: "groupinfo"
    }
  },

  onStart: async function ({ api, event }) {
    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "groupinfo.png");

    if (!fs.existsSync(cacheDir))
      fs.mkdirSync(cacheDir, { recursive: true });

    const info = await api.getThreadInfo(event.threadID);

    let male = 0;
    let female = 0;

    for (const user of info.userInfo || []) {
      if (user.gender === "MALE")
        male++;
      else if (user.gender === "FEMALE")
        female++;
    }

    const text =
`── Gʀᴏᴜᴘ Iɴғᴏ ──
Nᴀᴍᴇ      : ${info.threadName || "No Name"}
Iᴅ        : ${info.threadID}
Eᴍᴏᴊɪ     : ${info.emoji || "N/A"}
Aᴘᴘʀᴏᴠᴀʟ  : ${info.approvalMode ? "ON" : "OFF"}

Mᴇᴍʙᴇʀs   : ${(info.participantIDs || []).length}
Mᴀʟᴇ      : ${male}
Fᴇᴍᴀʟᴇ    : ${female}
Aᴅᴍɪɴs    : ${(info.adminIDs || []).length}
Mᴇssᴀɢᴇs  : ${info.messageCount || 0}

— Mᴏʜᴀᴍᴍᴀᴅ Aᴋᴀsʜ`;

    const send = () => {
      if (!fs.existsSync(imgPath))
        return api.sendMessage(
          text,
          event.threadID,
          event.messageID
        );

      api.sendMessage(
        {
          body: text,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => {
          try {
            if (fs.existsSync(imgPath))
              fs.unlinkSync(imgPath);
          } catch {}
        },
        event.messageID
      );
    };

    if (!info.imageSrc)
      return api.sendMessage(
        text,
        event.threadID,
        event.messageID
      );

    try {
      request(encodeURI(info.imageSrc))
        .pipe(fs.createWriteStream(imgPath))
        .on("close", send)
        .on("error", () => {
          try {
            if (fs.existsSync(imgPath))
              fs.unlinkSync(imgPath);
          } catch {}

          api.sendMessage(
            text,
            event.threadID,
            event.messageID
          );
        });
    } catch {
      return api.sendMessage(
        text,
        event.threadID,
        event.messageID
      );
    }
  }
};