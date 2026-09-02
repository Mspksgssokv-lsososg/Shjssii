module.exports = {
	config: {
		name: "linktg",
		aliases: ["link", "tglink"],
		version: "2.0.8",
		author: "SK-SIDDIK-KHAN",
		countDown: 5,
		role: 0,
		category: "utility",
		guide: "{pn} [uid/@mention]"
	},

	onStart: async function ({
		message,
		event,
		args,
		api
	}) {
		try {
			let userId = event.senderID;

			if (event.messageReply?.senderID) {
				userId = event.messageReply.senderID;
			}

			if (
				event.mentions &&
				Object.keys(event.mentions).length > 0
			) {
				userId = Object.keys(event.mentions)[0];
			}

			if (
				args?.[0] &&
				/^\d+$/.test(args[0])
			) {
				userId = args[0];
			}

			if (!userId) {
				return message.reply(
					"❌ User not found."
				);
			}

			userId = String(userId);

			let userInfo = null;

			try {
				const result = await api.getUserInfo(userId);
				userInfo =
					result?.[userId] ||
					result?.[String(userId)];
			} catch (e) {}

			const profileUrl =
				userInfo?.profileUrl ||
				`https://www.facebook.com/${userId}`;

			return message.reply(
				`🔗 Profile Link:\n${profileUrl}\n\n🆔 UID: ${userId}`
			);

		} catch (error) {
			console.error(
				"linktg error:",
				error.message
			);

			return message.reply(
				"❌ Profile link could not be found."
			);
		}
	}
};