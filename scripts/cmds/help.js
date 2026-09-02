const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "help",
		aliases: ["menu"],
		version: "3.2",
		author: "SK-SIDDIK-KHAN",
		countDown: 2,
		role: 0,
		description: "Help menu with button system",
		category: "system",
		guide: "{pn} [command | page | all]"
	},

	onStart: async function ({ event, message, args }) {
		let prefix = global.GoatBot?.config?.prefix || global.config?.prefix || "!";

		try {
			const groupPrefix = global.utils?.getPrefix?.(event.threadID);
			if (groupPrefix)
				prefix = groupPrefix;
		} catch (e) {}

		const HELP_IMG = "https://drive.usercontent.google.com/download?id=12YtKMHbqz_Aj5GNiPkHjQ-Jia6icDbDn&export=download";
		const botName = global.GoatBot?.config?.botName || global.config?.botName || "SIDDIK-BOT";
		const developer = global.GoatBot?.config?.ownerName || global.config?.ownerName || "S1DD1K";

		const commands = global.GoatBot?.commands || global.commands || new Map();

		const uniqueCommands = [
			...new Map(
				[...commands.values()]
					.filter(cmd => cmd?.config?.name)
					.map(cmd => [cmd.config.name, cmd])
			).values()
		].sort((a, b) =>
			a.config.name.localeCompare(b.config.name)
		);

		const totalCommands = uniqueCommands.length;

		if (args[0]?.toLowerCase() === "all") {
			let text = `📚 ${botName} - All Commands (${totalCommands})\n━━━━━━━━━━━━━━━━━━\n\n`;

			uniqueCommands.forEach((cmd, i) => {
				text += `${i + 1}. ${prefix}${cmd.config.name}\n`;
			});

			text += `\n━━━━━━━━━━━━━━━━━━\nUse: ${prefix}help <name>`;

			return message.reply({
				body: text,
				attachment: await global.utils.getStreamFromURL(HELP_IMG)
			});
		}

		if (args[0] && isNaN(args[0])) {
			const input = args[0].toLowerCase();

			const cmd =
				commands.get(input) ||
				uniqueCommands.find(c =>
					Array.isArray(c.config.aliases) &&
					c.config.aliases.some(alias =>
						String(alias).toLowerCase() === input
					)
				) ||
				uniqueCommands.find(c =>
					c.config.name.toLowerCase() === input
				);

			if (!cmd)
				return message.reply(`❌ "${args[0]}" পাওয়া যায়নি!`);

			const cfg = cmd.config;

			let perm = "Everyone 👥";

			if (cfg.role === 1)
				perm = "Group Admins 👮";

			if (cfg.role >= 2)
				perm = "Bot Owner 👑";

			let guide = "None";

			if (typeof cfg.guide === "string") {
				guide = cfg.guide.replaceAll("{pn}", `${prefix}${cfg.name}`);
			} else if (cfg.guide?.en) {
				guide = cfg.guide.en
					.replaceAll("{pn}", `${prefix}${cfg.name}`)
					.replaceAll("{p}", prefix);
			}

			let detail = `╭───❍ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝-𝐈𝐧𝐟𝐨 ❍───╮\n`;
			detail += `├‣ 📘 Name: ${prefix}${cfg.name}\n`;
			detail += `├‣ 🔁 Aliases: ${cfg.aliases?.length ? cfg.aliases.join(", ") : "None"}\n`;
			detail += `├‣ 👤 Author: ${cfg.author || "Unknown"}\n`;
			detail += `├‣ 📦 Version: ${cfg.version || "1.0"}\n`;
			detail += `├‣ 🔑 Role: ${cfg.role ?? 0} (${perm})\n`;
			detail += `├‣ 📂 Category: ${cfg.category || "N/A"}\n`;
			detail += `├‣ ⏱️ Cooldown: ${cfg.countDown || cfg.cooldown || 3}s\n`;
			detail += `├‣ 🔧 Prefix: ${cfg.usePrefix === false ? "No" : "Yes"}\n`;
			detail += `├‣ 📄 Description: ${cfg.description || "No description"}\n`;
			detail += `├‣ 📖 Guide: ${guide}\n`;
			detail += `╰─────────────────⟡`;

			return message.reply({
				body: detail,
				attachment: await global.utils.getStreamFromURL(HELP_IMG),
				buttons: [
					[
						{
							text: "📋 All",
							callback_data: "button:help:all"
						},
						{
							text: "❌ Close",
							callback_data: "button:help:close"
						}
					]
				]
			});
		}

		const perPage = 15;
		let page = parseInt(args[0]) || 1;

		const totalPages = Math.max(
			1,
			Math.ceil(totalCommands / perPage)
		);

		if (page < 1)
			page = totalPages;

		if (page > totalPages)
			page = 1;

		const start = (page - 1) * perPage;
		const list = uniqueCommands
			.slice(start, start + perPage)
			.map((cmd, i) =>
				`├‣ ${start + i + 1} ✿ ${prefix}${cmd.config.name}`
			)
			.join("\n");

		const caption = `╭───❍ Help-Menu ❍───╮
┏━━━━━━━━━━━━━━❥
${list}
┗━━━━━━━━━━━━━━❥

🌿 ★ ${botName} ★
Page: ${page}/${totalPages} | Total Cmd: [ ${totalCommands} ]
Dev: ${developer}`;

		return message.reply({
			body: caption,
			attachment: await global.utils.getStreamFromURL(HELP_IMG),
			buttons: [
				[
					{
						text: "◀️ Prev",
						callback_data: `button:help:page:${page - 1}`
					},
					{
						text: `${page}/${totalPages}`,
						callback_data: "button:help:noop"
					},
					{
						text: "Next ▶️",
						callback_data: `button:help:page:${page + 1}`
					}
				],
				[
					{
						text: "📋 All Commands",
						callback_data: "button:help:all"
					},
					{
						text: "❌ Close",
						callback_data: "button:help:close"
					}
				]
			]
		});
	},

	onButton: async function ({ message, data, event }) {
		const prefix =
			global.utils?.getPrefix?.(event.threadID) ||
			global.GoatBot?.config?.prefix ||
			"!";

		const HELP_IMG = "https://drive.usercontent.google.com/download?id=12YtKMHbqz_Aj5GNiPkHjQ-Jia6icDbDn&export=download";
		const botName =
			global.GoatBot?.config?.botName ||
			global.config?.botName ||
			"SIDDIK-BOT";

		const developer =
			global.GoatBot?.config?.ownerName ||
			global.config?.ownerName ||
			"S1DD1K";

		const commands =
			global.GoatBot?.commands ||
			global.commands ||
			new Map();

		const uniqueCommands = [
			...new Map(
				[...commands.values()]
					.filter(cmd => cmd?.config?.name)
					.map(cmd => [cmd.config.name, cmd])
			).values()
		].sort((a, b) =>
			a.config.name.localeCompare(b.config.name)
		);

		const totalCommands = uniqueCommands.length;
		const perPage = 15;
		const totalPages = Math.max(
			1,
			Math.ceil(totalCommands / perPage)
		);

		if (data === "noop")
			return message.reply(`📄 Help Menu: ${totalPages} pages available.`);

		if (data === "close")
			return message.reply("❌ Help menu closed.");

		if (data === "all") {
			let text = `📚 ${botName} - All Commands (${totalCommands})\n━━━━━━━━━━━━━━━━━━\n\n`;

			uniqueCommands.forEach((cmd, i) => {
				text += `${i + 1}. ${prefix}${cmd.config.name}\n`;
			});

			text += `\n━━━━━━━━━━━━━━━━━━\nUse: ${prefix}help <name>`;

			return message.reply({
				body: text,
				attachment: await global.utils.getStreamFromURL(HELP_IMG)
			});
		}

		if (data.startsWith("page:")) {
			let page = parseInt(data.split(":")[1]);

			if (isNaN(page))
				page = 1;

			if (page < 1)
				page = totalPages;

			if (page > totalPages)
				page = 1;

			const start = (page - 1) * perPage;

			const list = uniqueCommands
				.slice(start, start + perPage)
				.map((cmd, i) =>
					`├‣ ${start + i + 1} ✿ ${prefix}${cmd.config.name}`
				)
				.join("\n");

			const caption = `╭───❍ Help-Menu ❍───╮
┏━━━━━━━━━━━━━━❥
${list}
┗━━━━━━━━━━━━━━❥

🌿 ★ ${botName} ★
Page: ${page}/${totalPages} | Total Cmd: [ ${totalCommands} ]
Dev: ${developer}`;

			return message.reply({
				body: caption,
				attachment: await global.utils.getStreamFromURL(HELP_IMG),
				buttons: [
					[
						{
							text: "◀️ Prev",
							callback_data: `button:help:page:${page - 1}`
						},
						{
							text: `${page}/${totalPages}`,
							callback_data: "button:help:noop"
						},
						{
							text: "Next ▶️",
							callback_data: `button:help:page:${page + 1}`
						}
					],
					[
						{
							text: "📋 All Commands",
							callback_data: "button:help:all"
						},
						{
							text: "❌ Close",
							callback_data: "button:help:close"
						}
					]
				]
			});
		}
	}
};