module.exports = {
  config: {
    name: "buttons",
    version: "1.0.0",
    author: "SK-SIDDIK-KHAN",
    countDown: 3,
    role: 0,
    category: "utility",
    description: "Test Telegram inline buttons"
  },

  onStart: async function ({ message }) {
    await message.reply({
      body: "🔘 Button system is working!\n\nChoose an option:",
      buttons: [
        [
          { text: "🆔 My ID", callback_data: "cmd:spy" },
          { text: "⚙️ System", callback_data: "cmd:rtm" }
        ],
        [
          { text: "🔄 Test", callback_data: "button:buttons:test" },
          { text: "🌐 Telegram", url: "https://telegram.org" }
        ]
      ]
    });
  },

  onButton: async function ({ message, data }) {
    if (data === "test") {
      return message.reply("✅ Button callback is working correctly!");
    }
  }
};
