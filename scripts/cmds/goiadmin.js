module.exports = {
  config: {
    name: "goiadmin",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "auto",
    usePrefix: true
  },

  onChat: async function ({ message, event }) {
    try {
      const ownerID = 6734899387;
      const ownerUsername = "busy1here";

      if (event?.from?.id === ownerID) return;

      const text = event?.text || "";
      const mention = `@${ownerUsername}`;

      if (!text.toLowerCase().includes(mention.toLowerCase())) return;

      const messages = [
        "Don't Mention My Owner, Busy Right Now 💞",
        "আমার বস চিপায় বিজি আছে___🌝",
        "মেয়ে পটাতে গেছে___😁",
        "এমন ভাবে মেনশান না দিয়ে একটা জি এফ দাও__🙈",
        "এত ডাকিস কেন__😡\nআমার বস অনেক বিজি__☺️",
        "বস কই তুমি\nতোমারে এক বলদে খুঁজ করে__🤣"
      ];

      const randomMsg =
        messages[Math.floor(Math.random() * messages.length)];

      return await message.reply(randomMsg);
    } catch (error) {
      console.log("goiadmin error:", error.message);
    }
  },

  onStart: async function () {}
};