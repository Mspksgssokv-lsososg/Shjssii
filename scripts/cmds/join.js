module.exports = {
	config: {
		name: "join",
		aliases: ["joinlist", "groups"],
		author: "SK-SIDDIK-KHAN",
		version: "1.0",
		description: "Show active groups with join links",
		category: "admin",
		role: 2,
		countDown: 5,
		guide: "{pn}"
	},

	onStart: async function ({ api, event, message, threadsData }) {
		try {
			const allThreads = await threadsData.getAll();

			const groups = allThreads.filter(t => {
				const id = String(t.threadID || t.id || "");
				return id;
			});

			if (!groups.length)
				return message.reply("❌ No groups found in database!");

			const loading = await message.reply(
				`🔍 Found ${groups.length} groups in database...\n⏳ Checking active groups...`
			);

			const activeGroups = [];

			for (const group of groups) {
				const threadID = String(group.threadID || group.id || "");

				try {
					const info = await api.getThreadInfo(threadID);

					if (!info || !info.isGroup)
						continue;

					activeGroups.push({
						id: threadID,
						name:
							info.threadName ||
							group.threadName ||
							group.name ||
							"Unknown Group",
						info
					});
				} catch (e) {}
			}

			if (!activeGroups.length) {
				return message.reply(
					`❌ No active groups found!\n\n📂 DB Total: ${groups.length}\n✅ Active: 0`
				);
			}

			return sendJoinPage({
				api,
				message,
				event,
				groups: activeGroups,
				page: 0
			});

		} catch (e) {
			return message.reply(`❌ Error: ${e.message}`);
		}
	},

	onButton: async function ({ api, event, message, data, threadsData }) {
		try {
			if (data === "refresh") {
				const allThreads = await threadsData.getAll();

				const activeGroups = [];

				for (const group of allThreads) {
					const threadID = String(
						group.threadID || group.id || ""
					);

					try {
						const info = await api.getThreadInfo(threadID);

						if (!info || !info.isGroup)
							continue;

						activeGroups.push({
							id: threadID,
							name:
								info.threadName ||
								group.threadName ||
								group.name ||
								"Unknown Group",
							info
						});
					} catch (e) {}
				}

				if (!activeGroups.length)
					return message.reply("❌ No active groups found!");

				return sendJoinPage({
					api,
					message,
					event,
					groups: activeGroups,
					page: 0
				});
			}

			if (data.startsWith("page:")) {
				const page = parseInt(data.split(":")[1]);

				if (isNaN(page))
					return;

				const allThreads = await threadsData.getAll();
				const activeGroups = [];

				for (const group of allThreads) {
					const threadID = String(
						group.threadID || group.id || ""
					);

					try {
						const info = await api.getThreadInfo(threadID);

						if (!info || !info.isGroup)
							continue;

						activeGroups.push({
							id: threadID,
							name:
								info.threadName ||
								group.threadName ||
								group.name ||
								"Unknown Group",
							info
						});
					} catch (e) {}
				}

				return sendJoinPage({
					api,
					message,
					event,
					groups: activeGroups,
					page
				});
			}

		} catch (e) {
			return message.reply(`❌ Error: ${e.message}`);
		}
	}
};

async function sendJoinPage({
	api,
	message,
	event,
	groups,
	page
}) {
	const PER_PAGE = 5;

	const totalPages = Math.max(
		1,
		Math.ceil(groups.length / PER_PAGE)
	);

	if (page < 0)
		page = totalPages - 1;

	if (page >= totalPages)
		page = 0;

	const start = page * PER_PAGE;

	const pageGroups = groups.slice(
		start,
		start + PER_PAGE
	);

	let text = `╭─❖─〔 JOIN GROUPS 〕─❖─╮
│ ✅ Active: ${groups.length}
│ 📄 Page: ${page + 1}/${totalPages}
╰─❖─〔 SIDDIK-BOT 〕─❖─╯

`;

	const buttons = [];

	for (let i = 0; i < pageGroups.length; i++) {
		const group = pageGroups[i];

		const threadID = String(group.id);

		let title =
			group.info?.threadName ||
			group.name ||
			"Unknown Group";

		title = title
			.replace(/[\u0000-\u001F\u007F]/g, "")
			.trim()
			.slice(0, 40);

		const index = start + i + 1;

		text += `${index}. ${title}\n`;
		text += ` 🆔 ${threadID}\n`;

		let link = null;

		try {
			if (group.info?.threadName) {
				link = `https://www.facebook.com/messages/t/${threadID}`;
			}
		} catch (e) {}

		if (link) {
			buttons.push([
				{
					text: `🚀 Open ${title.slice(0, 20)}`,
					url: link
				}
			]);
		}

		text += "\n";
	}

	const navigation = [];

	if (page > 0) {
		navigation.push({
			text: "⬅️ Prev",
			callback_data: `button:join:page:${page - 1}`
		});
	}

	if (page < totalPages - 1) {
		navigation.push({
			text: "Next ➡️",
			callback_data: `button:join:page:${page + 1}`
		});
	}

	if (navigation.length)
		buttons.push(navigation);

	buttons.push([
		{
			text: "🔄 Refresh List",
			callback_data: "button:join:refresh"
		}
	]);

	return message.reply({
		body: text,
		buttons
	});
}