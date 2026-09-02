module.exports = {
	config: {
		name: "gojol",
		version: "1.0",
		author: "SK-SIDDIK-KHAN",
		countDown: 5,
		role: 0,
		category: "user",
	},

	 onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply({
      body: "Loading Islamic Gojol... Please Wait ⏰",
    });

	 var link = [

  "https://drive.google.com/uc?id=1xjyq3BrlW3bGrp8y7eedQSuddCbdvLMN",

   "https://drive.google.com/uc?id=1CCQqJVqvFsgyAd4ZjZB0BJ3lGN4Kc2l2",

   "https://drive.google.com/uc?id=1xnht0PdBt9DnLGzW7GmJUTsTIJnxxByo",

   "https://drive.google.com/uc?id=1CDCa4AlqErr1b7JRNWL62AP0WtdjlSOE",

   "https://drive.google.com/uc?id=1yK0A3lyIJoPRp6g3UjNrC31n0yLfc1Ht",

   "https://drive.google.com/uc?id=1ySwrEG6xVqPdY5BcBP8I3YFCUOX4jV9e",

   "https://drive.google.com/uc?id=1CESeRi5Ue4HR6GSDfYJrREGGcsvYJvAB",

 ];
     let audio = link[Math.floor(Math.random()*link.length)]

   if (senderID !== null) {
      message.reply({
        body: '[ ɪꜱʟᴀᴍɪᴄ-ɢᴏᴊᴏʟ ]',
        attachment: await global.utils.getStreamFromURL(audio)
      });

      setTimeout(() => {
        api.unsendMessage(loadingMessage.messageID);
      }, 800);
    }
  },
};
