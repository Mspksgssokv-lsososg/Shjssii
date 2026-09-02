const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "gcinfo",
		aliases: ["groupinfo", "ginfo"],
		version: "8.1.9",
		author: "SK-SIDDIK-KHAN",
		countDown: 5,
		role: 0,
		description: "Show detailed group information with buttons",
		category: "utility",
		guide: "{pn}"
	},

	onStart: async function ({ api, event, message, threadsData, usersData }) {
		const threadID = event.threadID;

		try {
			const threadInfo = await api.getThreadInfo(threadID);

			if (!threadInfo.isGroup)
				return message.reply("❌ This command can only be used in groups.");

			const text = await buildGroupInfo({
				api,
				threadID,
				threadInfo,
				threadsData,
				usersData
			});

			let attachment = null;

			try {
				const imageURL =
					threadInfo.imageSrc ||
					threadInfo.imageUrl ||
					threadInfo.image;

				if (imageURL)
					attachment = await global.utils.getStreamFromURL(imageURL);
			} catch (e) {}

			const buttons = [
				[
					{
						text: "👥 Show Admins",
						callback_data: "button:gcinfo:admins"
					},
					{
						text: "📊 Stats",
						callback_data: "button:gcinfo:stats"
					}
				],
				[
					{
						text: "🔄 Refresh",
						callback_data: "button:gcinfo:refresh"
					}
				]
			];

			if (attachment)
				return message.reply({
					body: text,
					attachment,
					buttons
				});

			return message.reply({
				body: text,
				buttons
			});
		} catch (err) {
			return message.reply(`❌ Failed to get group information.\n\n${err.message}`);
		}
	},

	onButton: async function ({
		api,
		event,
		message,
		data,
		threadsData,
		usersData
	}) {
		const threadID = event.threadID;

		try {
			const threadInfo = await api.getThreadInfo(threadID);

			if (!threadInfo.isGroup)
				return message.reply("❌ This command can only be used in groups.");

			if (data === "admins") {
				const adminIDs = Array.isArray(threadInfo.adminIDs)
					? threadInfo.adminIDs
					: [];

				let text = `👥 𝗚𝗿𝗼𝘂𝗽 𝗔𝗱𝗺𝗶𝗻𝘀 (${adminIDs.length})\n\n`;

				if (!adminIDs.length) {
					text += "❌ No admin information found.";
				} else {
					for (let i = 0; i < adminIDs.length; i++) {
						const uid = adminIDs[i];
						let name = "Unknown";

						try {
							name = await usersData.getName(uid);
						} catch (e) {}

						text += `${i + 1}. 👨‍💼 ${name}\n`;
						text += `   └ ID: ${uid}\n`;
					}
				}

				return message.reply({
					body: text,
					buttons: [
						[
							{
								text: "« Back",
								callback_data: "button:gcinfo:refresh"
							}
						]
					]
				});
			}

			if (data === "stats") {
				const threadData = await threadsData.get(threadID);
				const storedData = threadData?.data || {};

				const userMessages =
					storedData.userMessages ||
					threadData?.userMessages ||
					{};

				let totalMessages =
					threadData?.totalMessages ||
					storedData.totalMessages ||
					0;

				if (!totalMessages && typeof userMessages === "object") {
					totalMessages = Object.values(userMessages).reduce(
						(sum, value) => sum + (Number(value) || 0),
						0
					);
				}

				const activeUsers =
					typeof userMessages === "object"
						? Object.keys(userMessages).length
						: 0;

				const sorted = Object.entries(userMessages)
					.sort(([, a], [, b]) => Number(b) - Number(a))
					.slice(0, 10);

				let text =
					`📊 𝗚𝗿𝗼𝘂𝗽 𝗦𝘁𝗮𝘁𝘀\n\n` +
					`📨 Total Messages: ${totalMessages}\n` +
					`👥 Active Users: ${activeUsers}\n\n` +
					`🏆 𝗧𝗼𝗽 𝟭𝟬 𝗔𝗰𝘁𝗶𝘃𝗲 𝗨𝘀𝗲𝗿𝘀\n\n`;

				if (!sorted.length) {
					text += "❌ No message statistics available.";
				} else {
					for (let i = 0; i < sorted.length; i++) {
						const [uid, count] = sorted[i];
						let name = "Unknown";

						try {
							name = await usersData.getName(uid);
						} catch (e) {}

						text += `${i + 1}. ${name}\n`;
						text += `   └ ${count} messages\n`;
					}
				}

				return message.reply({
					body: text,
					buttons: [
						[
							{
								text: "« Back",
								callback_data: "button:gcinfo:refresh"
							}
						]
					]
				});
			}

			if (data === "refresh") {
				const freshThreadInfo = await api.getThreadInfo(threadID);

				const text = await buildGroupInfo({
					api,
					threadID,
					threadInfo: freshThreadInfo,
					threadsData,
					usersData
				});

				return message.reply({
					body: text,
					buttons: [
						[
							{
								text: "👥 Show Admins",
								callback_data: "button:gcinfo:admins"
							},
							{
								text: "📊 Stats",
								callback_data: "button:gcinfo:stats"
							}
						],
						[
							{
								text: "🔄 Refresh",
								callback_data: "button:gcinfo:refresh"
							}
						]
					]
				});
			}
		} catch (err) {
			return message.reply(`❌ Something went wrong.\n\n${err.message}`);
		}
	}
};

async function buildGroupInfo({
	api,
	threadID,
	threadInfo,
	threadsData
}) {
	const threadData = await threadsData.get(threadID);
	const dbData = threadData?.data || {};
	const settings = threadData?.settings || {};

	const adminIDs = Array.isArray(threadInfo.adminIDs)
		? threadInfo.adminIDs
		: [];

	const participantIDs = Array.isArray(threadInfo.participantIDs)
		? threadInfo.participantIDs
		: [];

	const totalMembers =
		threadInfo.participantIDs?.length ||
		participantIDs.length ||
		0;

	const botID = api.getCurrentUserID();

	const botIsAdmin = adminIDs.some(
		id => String(id) === String(botID)
	);

	const approvalMode =
		threadInfo.approvalMode ??
		threadData?.approvalMode ??
		settings.approvalMode ??
		dbData.approvalMode ??
		false;

	const autoApprove =
		settings.autoApprove ??
		dbData.autoApprove ??
		false;

	const antiOut =
		settings.antiOut ??
		dbData.antiOut ??
		false;

	const customPrefix =
		settings.customPrefix ??
		dbData.customPrefix ??
		global.GoatBot?.config?.prefix ??
		global.config?.prefix ??
		"!";

	const userMessages =
		dbData.userMessages ||
		threadData?.userMessages ||
		{};

	let totalMessages =
		threadData?.totalMessages ??
		dbData.totalMessages ??
		0;

	if (!totalMessages && typeof userMessages === "object") {
		totalMessages = Object.values(userMessages).reduce(
			(sum, value) => sum + (Number(value) || 0),
			0
		);
	}

	const groupName =
		threadInfo.threadName ||
		threadData?.threadName ||
		"Unknown Group";

	let text = `╭━━━〔 📊 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢 〕━━━╮
┃
┃ 📂 𝗡𝗮𝗺𝗲
┃ └ ${groupName}
┃
┃ 🆔 𝗧𝗵𝗿𝗲𝗮𝗱 𝗜𝗗
┃ └ ${threadID}
┃
┃ 📝 𝗧𝘆𝗽𝗲
┃ └ Group Chat
┃
┃ 👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀
┃ └ ${totalMembers}
┃
┃ 👨‍💼 𝗔𝗱𝗺𝗶𝗻𝘀
┃ └ ${adminIDs.length}
┃
┃ 🤖 𝗕𝗼𝘁 𝗔𝗱𝗺𝗶𝗻
┃ └ ${botIsAdmin ? "✅ Yes" : "❌ No"}
┃
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 ⚙️ 𝗕𝗢𝗧 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 〕━━╮
┃ 🔐 Approval
┃ └ ${approvalMode ? "✅ Enabled" : "❌ Disabled"}
┃
┃ 🤖 Auto Approve
┃ └ ${autoApprove ? "✅ Enabled" : "❌ Disabled"}
┃
┃ 🚪 Anti-Out
┃ └ ${antiOut ? "✅ Enabled" : "❌ Disabled"}
┃
┃ 📍 Prefix
┃ └ ${customPrefix}
┃
┃ 📨 Messages
┃ └ ${totalMessages}
┃
╰━━━━━━━━━━━━━━━━━━━━╯`;

	return text;
}