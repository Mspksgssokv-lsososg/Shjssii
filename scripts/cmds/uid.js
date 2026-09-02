module.exports = {
	config: {
		name: "uid",
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem Telegram user id của người dùng",
			en: "View Telegram user id of user"
		},
		category: "info",
		guide: {
			vi: "   {pn}: dùng để xem Telegram user id của bạn"
				+ "\n   {pn} @tag: xem Telegram user id của những người được tag"
				+ "\n   {pn} <link profile>: Telegram user id của link profile"
				+ "\n   Phản hồi tin nhắn của người khác kèm lệnh để xem Telegram user id của họ",
			en: "   {pn}: use to view your Telegram user id"
				+ "\n   {pn} @tag: view Telegram user id of tagged people"
				+ "\n   {pn} <profile link>: view Telegram user id of a Telegram profile link"
				+ "\n   Reply to someone's message with the command to view their Telegram user id"
		}
	},

	langs: {
		vi: {
			syntaxError: "Vui lòng tag người muốn xem uid hoặc để trống để xem uid của bản thân"
		},
		en: {
			syntaxError: "Please tag the person you want to view uid or leave it blank to view your own uid"
		}
	},

	onStart: async function ({ message, event, getLang }) {
		if (event.messageReply)
			return message.reply(String(event.messageReply.senderID || "unknown"));

		const mentions = Object.entries(event.mentions || {});
		if (mentions.length) {
			return message.reply(
				mentions.map(([id, name]) => `${String(name).replace("@", "")}: ${id}`).join("\n")
			);
		}

		return message.reply(String(event.senderID || getLang("syntaxError")));
	}
};