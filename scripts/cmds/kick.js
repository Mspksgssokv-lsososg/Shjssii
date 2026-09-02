module.exports = {
	config: {
		name: "kick",
		aliases: ["kickout"],
		author: "SK-SIDDIK-KHAN",
		version: "3.0.9",
		countDown: 5,
		role: 1,
		description: "Kick a user by reply, UID or mention",
		category: "admin",
		guide: "{pn} [uid/@mention]"
	},

	onStart: async function ({
		event,
		api,
		message,
		args,
		usersData
	}) {
		try {
			const threadID = event.threadID;
			let targetID = null;
			let targetName = "User";

			if (!event.isGroup)
				return message.reply("⚠️ এই command শুধু গ্রুপে ব্যবহার করা যাবে!");

			if (event.messageReply?.senderID) {
				targetID = event.messageReply.senderID;
			}

			if (!targetID && Object.keys(event.mentions || {}).length) {
				targetID = Object.keys(event.mentions)[0];
			}

			if (!targetID && args[0]) {
				const input = args[0].replace("@", "").trim();

				if (/^\d+$/.test(input)) {
					targetID = input;
				} else {
					try {
						const user = await usersData.get(input);

						if (user?.userID) {
							targetID = user.userID;
						}
					} catch (e) {}
				}
			}

			if (!targetID) {
				return message.reply(
					"⚠️ কাকে kick করবে?\n\n" +
					"1️⃣ তার message-এ Reply দিয়ে command দাও\n" +
					`2️⃣ ${global.GoatBot?.config?.prefix || "!"}kick 100000000000000\n` +
					"3️⃣ @mention করে command দাও"
				);
			}

			targetID = String(targetID);

			let targetInfo = null;

			try {
				const info = await api.getUserInfo(targetID);
				targetInfo = info?.[targetID];
			} catch (e) {}

			targetName =
				targetInfo?.name ||
				await usersData.getName(targetID).catch(() => "User");

			const botID = String(api.getCurrentUserID());

			if (targetID === botID)
				return message.reply("⚠️ আমাকে kick করা যাবে না!");

			if (targetID === String(event.senderID))
				return message.reply("⚠️ নিজেকে kick করা যাবে না!");

			const botAdmins =
				global.GoatBot?.config?.adminBot ||
				global.config?.adminUID ||
				[];

			if (
				Array.isArray(botAdmins) &&
				botAdmins.map(String).includes(targetID)
			) {
				return message.reply("⚠️ Bot Admin কে kick করা যাবে না!");
			}

			const threadInfo = await api.getThreadInfo(threadID);

			const adminIDs = (threadInfo.adminIDs || []).map(String);

			if (adminIDs.includes(targetID)) {
				return message.reply("⚠️ গ্রুপ Admin কে kick করা যাবে না!");
			}

			if (!adminIDs.includes(botID)) {
				return message.reply("⚠️ আমাকে আগে Group Admin বানাও!");
			}

			if (!adminIDs.includes(String(event.senderID))) {
				return message.reply("⚠️ শুধু Group Admin এই command ব্যবহার করতে পারবে!");
			}

			if (
				typeof api.removeUserFromGroup !== "function"
			) {
				return message.reply(
					"❌ এই bot system-এ user remove করার API পাওয়া যাচ্ছে না!"
				);
			}

			await api.removeUserFromGroup(targetID, threadID);

			return message.reply(
				`✅ ${targetName} কে group থেকে kick করা হয়েছে!\n\n` +
				`🆔 ID: ${targetID}\n` +
				`👮 By: ${event.senderID}`
			);

		} catch (error) {
			console.error("Kick error:", error);

			return message.reply(
				`❌ Kick হয়নি!\n\n${error.message}`
			);
		}
	}
};