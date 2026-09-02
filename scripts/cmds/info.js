module.exports = {
	config: {
		name: "info",
		aliases: ["whois", "userinfo", "profile"],
		author: "SK-SIDDIK-KHAN",
		version: "10.0",
		countDown: 5,
		role: 0,
		description: "Ultimate user information",
		category: "utility",
		guide: "{pn} [@mention]"
	},

	onStart: async function ({ event, api, message, usersData, args }) {
		try {
			let userId = event.senderID;

			if (event.messageReply?.senderID) {
				userId = event.messageReply.senderID;
			}

			if (Object.keys(event.mentions || {}).length > 0) {
				userId = Object.keys(event.mentions)[0];
			}

			if (args[0] && /^\d+$/.test(args[0])) {
				userId = args[0];
			}

			if (!userId)
				return message.reply("❌ ইউজার পাওয়া যায়নি।");

			let userInfo = null;

			try {
				userInfo = await api.getUserInfo(userId);
				userInfo = userInfo?.[userId] || userInfo?.[String(userId)];
			} catch (e) {}

			let threadInfo = null;

			try {
				threadInfo = await api.getThreadInfo(event.threadID);
			} catch (e) {}

			let userData = null;

			try {
				userData = await usersData.get(userId);
			} catch (e) {}

			const firstName =
				userInfo?.firstName ||
				userData?.name ||
				"None";

			const lastName =
				userInfo?.lastName ||
				"None";

			const fullName =
				`${firstName} ${lastName !== "None" ? lastName : ""}`.trim();

			const gender =
				userInfo?.gender === 1
					? "Female 👩"
					: userInfo?.gender === 2
						? "Male 👨"
						: "Unknown";

			const profileUrl =
				userInfo?.profileUrl ||
				`https://facebook.com/${userId}`;

			let avatar = null;

			try {
				avatar = await global.utils.getStreamFromURL(
					`https://graph.facebook.com/${userId}/picture?width=1024&height=1024`
				);
			} catch (e) {}

			const isAdmin =
				threadInfo?.adminIDs?.some(
					id => String(id) === String(userId)
				);

			const isBot =
				String(userId) === String(api.getCurrentUserID());

			const userName =
				userInfo?.vanity ||
				userInfo?.username ||
				"None";

			const joinedAt =
				userData?.createdAt
					? new Date(userData.createdAt).toLocaleDateString()
					: "Unknown";

			const fullInfo =
`┏━━━━━━━━━━━━━━━━━━━┓
┃ 👑 ULTIMATE INFO 👑
┣━━━━━━━━━━━━━━━━━━━┫
┃ 👤 ${fullName}
┃ 🔹 First: ${firstName}
┃ 🔹 Last: ${lastName}
┃ 🔹 User: ${userName}
┃ 🆔 ID: ${userId}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🔍 FACEBOOK
┃ • Bot: ${isBot ? "Yes 🤖" : "No 👤"}
┃ • Gender: ${gender}
┃ • Admin: ${isAdmin ? "Yes 👮" : "No"}
┃ • Profile: ${profileUrl}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🏷️ STATUS
┃ • Group: ${threadInfo?.threadName || "Unknown"}
┃ • Joined DB: ${joinedAt}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 📊 BOT
┃ • Banned: ${userData?.banned ? "Yes 🚫" : "No ✅"}
┃ • Money: ${userData?.money || 0}
┃ • Exp: ${userData?.exp || 0}
┃ • Level: ${userData?.level || 0}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 🤖 S1DD1K
┗━━━━━━━━━━━━━━━━━━━┛`;

			if (avatar) {
				return message.reply({
					body: fullInfo,
					attachment: avatar
				});
			}

			return message.reply(fullInfo);

		} catch (e) {
			return message.reply(`❌ Error: ${e.message}`);
		}
	}
};