module.exports = {
	config: {
		name: "left",
		aliases: ["leave"],
		author: "SK-SIDDIK-KHAN",
		version: "6.2.0",
		category: "admin",
		role: 2,
		countDown: 5,
		description: "Leave groups from bot",
		guide: "{pn}"
	},

	onStart: async function ({ api, event, message, threadsData }) {
		try {
			const allThreads = await threadsData.getAll();

			const groups = allThreads.filter(t => {
				const id = String(t.threadID || t.id || "");
				return id && t.isGroup !== false;
			});

			if (!groups.length)
				return message.reply("❌ No groups found!");

			const loading = await message.reply(
				`🔍 Found ${groups.length} groups...\n⏳ Checking active groups...`
			);

			const activeGroups = [];

			for (const group of groups) {
				const threadID = String(
					group.threadID || group.id || ""
				);

				if (!threadID)
					continue;

				try {
					const info = await api.getThreadInfo(threadID);

					if (!info)
						continue;

					activeGroups.push({
						id: threadID,
						name:
							info.threadName ||
							group.threadName ||
							group.name ||
							"Unknown Group"
					});
				} catch (e) {}
			}

			if (!activeGroups.length) {
				return message.reply("❌ No active groups found!");
			}

			global.leftCache ??= {};
			global.leftSelected ??= {};

			global.leftCache[event.threadID] = activeGroups;
			global.leftSelected[event.threadID] = new Set();

			await sendPage(
				api,
				event.threadID,
				0,
				loading?.messageID
			);

		} catch (e) {
			return message.reply(`❌ Error: ${e.message}`);
		}
	},

	onButton: async function ({
		api,
		event,
		message,
		data,
		threadsData
	}) {
		try {
			const threadID = event.threadID;

			if (!global.leftCache?.[threadID])
				return;

			const groups = global.leftCache[threadID];
			const selected =
				global.leftSelected[threadID] || new Set();

			if (data === "left_cancel") {
				delete global.leftCache[threadID];
				delete global.leftSelected[threadID];

				return message.reply("✅ Cancelled!");
			}

			if (data.startsWith("left_page:")) {
				const page = parseInt(
					data.split(":")[1]
				);

				if (isNaN(page))
					return;

				return sendPage(
					api,
					threadID,
					page
				);
			}

			if (data.startsWith("left_toggle:")) {
				const index = parseInt(
					data.split(":")[1]
				);

				if (isNaN(index) || !groups[index])
					return;

				if (selected.has(index))
					selected.delete(index);
				else
					selected.add(index);

				global.leftSelected[threadID] =
					selected;

				return sendPage(
					api,
					threadID,
					Math.floor(index / 5)
				);
			}

			if (data.startsWith("left_leave:")) {
				const index = parseInt(
					data.split(":")[1]
				);

				const group = groups[index];

				if (!group)
					return;

				try {
					await api.removeUserFromGroup(
						api.getCurrentUserID(),
						group.id
					);
				} catch (e) {
					return message.reply(
						`❌ Leave failed!\n${group.name}\n${e.message}`
					);
				}

				groups.splice(index, 1);

				const newSelected = new Set();

				for (const item of selected) {
					if (item === index)
						continue;

					newSelected.add(
						item > index
							? item - 1
							: item
					);
				}

				global.leftSelected[threadID] =
					newSelected;

				if (!groups.length) {
					delete global.leftCache[threadID];
					delete global.leftSelected[threadID];

					return message.reply(
						"✅ All selected groups have been left!"
					);
				}

				return sendPage(
					api,
					threadID,
					Math.min(
						Math.floor(index / 5),
						Math.max(
							0,
							Math.ceil(groups.length / 5) - 1
						)
					)
				);
			}

			if (data === "left_leave_selected") {
				if (!selected.size) {
					return message.reply(
						"⚠️ আগে group select করো!"
					);
				}

				const indexes = [...selected]
					.sort((a, b) => b - a);

				let success = 0;

				for (const index of indexes) {
					const group = groups[index];

					if (!group)
						continue;

					try {
						await api.removeUserFromGroup(
							api.getCurrentUserID(),
							group.id
						);

						groups.splice(index, 1);
						success++;
					} catch (e) {}
				}

				global.leftSelected[threadID] =
					new Set();

				if (!groups.length) {
					delete global.leftCache[threadID];
					delete global.leftSelected[threadID];

					return message.reply(
						`✅ Left ${success} groups successfully!`
					);
				}

				return sendPage(
					api,
					threadID,
					0
				);
			}

		} catch (e) {
			console.error("LEFT ERROR:", e);
			return message.reply(
				`❌ Error: ${e.message}`
			);
		}
	}
};

async function sendPage(
	api,
	threadID,
	page,
	messageID = null
) {
	const groups =
		global.leftCache?.[threadID] || [];

	const selected =
		global.leftSelected?.[threadID] ||
		new Set();

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

	let body =
		`╭─❖─〔 BOT GROUPS 〕─❖─╮\n` +
		`│ 👥 Active: ${groups.length}\n` +
		`│ 📄 Page: ${page + 1}/${totalPages}\n` +
		`│ ☑️ Selected: ${selected.size}\n` +
		`╰─❖─〔 SIDDIK-BOT 〕─❖─╯\n\n`;

	const buttons = [];

	for (let i = 0; i < pageGroups.length; i++) {
		const group = pageGroups[i];

		const index = start + i;

		const title = String(
			group.name || "Unknown Group"
		)
			.replace(/[\u0000-\u001F\u007F]/g, "")
			.trim()
			.slice(0, 25);

		body +=
			`${selected.has(index) ? "☑️" : "⬜"} ` +
			`${index + 1}. ${title}\n` +
			`🆔 ${group.id}\n\n`;

		buttons.push([
			{
				text: selected.has(index)
					? `☑️ Deselect ${index + 1}`
					: `⬜ Select ${index + 1}`,
				callback_data:
					`left_toggle:${index}`
			},
			{
				text: `🚪 Leave ${index + 1}`,
				callback_data:
					`left_leave:${index}`
			}
		]);
	}

	const navigation = [];

	if (page > 0) {
		navigation.push({
			text: "⬅️ Prev",
			callback_data:
				`left_page:${page - 1}`
		});
	}

	if (page < totalPages - 1) {
		navigation.push({
			text: "Next ➡️",
			callback_data:
				`left_page:${page + 1}`
		});
	}

	if (navigation.length)
		buttons.push(navigation);

	buttons.push([
		{
			text: `🚪 Leave Selected (${selected.size})`,
			callback_data:
				"left_leave_selected"
		}
	]);

	buttons.push([
		{
			text: "❌ Cancel",
			callback_data: "left_cancel"
		}
	]);

	const form = {
		body,
		buttons
	};

	if (messageID) {
		try {
			return api.editMessage(
				form,
				messageID
			);
		} catch (e) {}
	}

	return global.GoatBot?.api?.sendMessage(
		form.body,
		threadID,
		{ attachment: null }
	);
}