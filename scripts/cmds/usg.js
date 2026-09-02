const messageStore = {};

module.exports = {
	config: {
		name: "usg",
		version: "1.0",
		author: "xnil6x",
		shortDescription: "Log unsent messages",
		longDescription: "Logs deleted messages.",
		category: "utility",
		role: 0
	},

	onStart: async function () {},

	onChat: async function ({ api, event }) {
		const ADMIN_UIDS = ["6734899387"];

		try {
			if (!ADMIN_UIDS.includes(String(event.senderID))) {
				return;
			}

			if (
				event.body &&
				event.messageID &&
				event.type !== "message_unsend"
			) {
				messageStore[event.messageID] = {
					body: event.body,
					senderID: event.senderID,
					threadID: event.threadID,
					time: new Date()
				};

				return;
			}

			if (event.type === "message_unsend") {
				const savedMsg = messageStore[event.messageID];

				const senderInfo = await api.getUserInfo(event.senderID);
				const senderName =
					senderInfo?.[event.senderID]?.name || "Unknown User";

				let reportMsg =
					`⚠️ Message Unsend Detected\n\n` +
					`━━━━━━━━━━━━━━━━━━\n` +
					`👤 Sender: ${senderName} (${event.senderID})\n` +
					`📝 Message ID: ${event.messageID}\n` +
					`⏰ Time: ${new Date().toLocaleString("en-BD", {
						timeZone: "Asia/Dhaka"
					})}\n` +
					`━━━━━━━━━━━━━━━━━━\n`;

				if (savedMsg?.body) {
					reportMsg += `🗑️ Deleted Content: ${savedMsg.body}`;
				} else {
					reportMsg +=
						"ℹ️ Content was deleted before I could log it.";
				}

				await api.sendMessage(
					reportMsg,
					event.threadID
				);

				delete messageStore[event.messageID];
			}
		} catch (error) {
			console.error("[USG ERROR]", error);
		}
	}
};