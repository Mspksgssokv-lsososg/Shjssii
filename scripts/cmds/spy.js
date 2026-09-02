module.exports = {
  config: {
    name: "spy",
    aliases: ["userinfo"],
    version: "2.0.0",
    credits: "S1DD1K",
    role: 0,
    usePrefix: true,
    description: "Get Telegram user information and profile photo",
    category: "utility",
    guide: "[user_id]",
    countDown: 5
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      const chatId = event.threadID;
      if (!chatId) return message.reply("❌ Chat not found.");

      const userId =
        event.messageReply?.senderID ||
        args?.[0] ||
        event.senderID;

      if (!userId || !/^-?\d+$/.test(String(userId))) {
        return message.reply("❌ User not found. Reply to a user's message or use /spy USER_ID.");
      }

      const id = Number(userId);
      const user = await api.call("getChat", { chat_id: id });

      let photos = null;
      try {
        photos = await api.call("getUserProfilePhotos", { user_id: id, limit: 1 });
      } catch (_) {}

      const fullName =
        [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
        user.title ||
        "No name";

      const username = user.username ? `@${user.username}` : "No username";
      const status = user.type === "private" ? "User" : (user.type || "Unknown");

      // Telegram Bot API does not expose a user's private bio via getChat.
      const bio = "Not available via Bot API";
      const userLink = user.username
        ? `https://t.me/${user.username}`
        : `tg://user?id=${id}`;

      const infoMessage = [
        "╭──✦ [ 𝐔𝐬𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ]",
        `├‣ 🆔 𝚄𝚜𝚎𝚛 𝙸𝙳: ${id}`,
        `├‣ 👤 𝙵𝚞𝚕𝚕 𝙽𝚊𝚖𝚎: ${fullName}`,
        `├‣ 📱 𝚄𝚜𝚎𝚛𝚗𝚊𝚖𝚎: ${username}`,
        `├‣ 📝 𝙱𝚒𝚘: ${bio}`,
        `├‣ 📊 𝚂𝚝𝚊𝚝𝚞𝚜: ${status}`,
        `╰‣ 🔗 𝚄𝚜𝚎𝚛 𝙻𝚒𝚗𝚔: ${userLink}`
      ].join("\n");

      const photo = photos?.photos?.[0]?.at(-1);

      if (photo?.file_id) {
        await message.reply({
          body: infoMessage,
          attachment: [{ type: "photo", fileID: photo.file_id }]
        });
      } else {
        await message.reply(infoMessage);
      }
    } catch (err) {
      console.error("❌ spy error:", err);
      await message.reply(`❌ Failed to get user information\n\nReason: ${err.message || "Unknown error"}`);
    }
  }
};
