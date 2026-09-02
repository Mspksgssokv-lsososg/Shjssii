const startTime = Date.now();

module.exports = {
  config: {
    name: "runtme",
    aliases: ["rtime", "uptime"],
    version: "2.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Check bot uptime",
    category: "system",
    role: 0,
    cooldown: 2,
    usePrefix: true
  },

  onStart: async function ({ ctx, event, message, api }) {
    try {
      const chatId = event?.chat?.id || ctx?.chat?.id;

      if (!chatId) return;

      const diff = Date.now() - startTime;
      const totalSeconds = Math.floor(diff / 1000);

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const text =
`╭━━━━━━━━━━━━━━━━━━╮
┃ ⏳ 𝐀𝐜𝐭𝐢𝐯𝐞 𝐓𝐢𝐦𝐞
┣━━━━━━━━━━━━━━━━━━
┃ 📅 ${days} Day(s)
┃ ⏰ ${hours} Hour(s)
┃ ⏱️ ${minutes} Minute(s)
┃ ⌛ ${seconds} Second(s)
┣━━━━━━━━━━━━━━━━━━
┃ 🤖 Status: Online ✅
╰━━━━━━━━━━━━━━━━━━╯`;

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "👑 Bot Owner",
                url: "https://t.me/busy1here"
              }
            ]
          ]
        }
      };

      if (api?.sendMessage) {
        return await api.sendMessage(
          chatId,
          text,
          {
            ...keyboard,
            reply_to_message_id: event?.message_id
          }
        );
      }

      if (ctx?.telegram?.sendMessage) {
        return await ctx.telegram.sendMessage(
          chatId,
          text,
          {
            ...keyboard,
            reply_to_message_id: event?.message_id
          }
        );
      }

      return await message.reply(text, keyboard);

    } catch (err) {
      console.log("❌ uptime error:", err.message);

      try {
        const chatId = event?.chat?.id || ctx?.chat?.id;

        if (chatId && api?.sendMessage) {
          return await api.sendMessage(
            chatId,
            "❌ Failed to get bot uptime"
          );
        }

        if (chatId && ctx?.telegram?.sendMessage) {
          return await ctx.telegram.sendMessage(
            chatId,
            "❌ Failed to get bot uptime"
          );
        }

        return await message.reply(
          "❌ Failed to get bot uptime"
        );
      } catch {}
    }
  }
};