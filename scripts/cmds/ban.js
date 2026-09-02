const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "ban",
		version: "2.0",
		author: "NTKhang + Telegram conversion",
		countDown: 5,
		role: 1,
		description: {
			en: "Ban, unban, check and list banned Telegram group members"
		},
		category: "group",
		guide: {
			en:
				"   {pn} [reply|user_id] [reason]: Ban a member"
				+ "\n   {pn} check: Check banned members and kick them if they rejoin"
				+ "\n   {pn} unban [reply|user_id]: Unban a member"
				+ "\n   {pn} list: View banned members"
		}
	},

	langs: {
		en: {
			notFoundTarget: "⚠️ | Reply to the user's message or provide a Telegram user ID.",
			notFoundTargetUnban: "⚠️ | Reply to the user's message or provide a Telegram user ID to unban.",
			userNotBanned: "⚠️ | User %1 is not banned in this group.",
			unbannedSuccess: "✅ | %1 has been unbanned.",
			cantSelfBan: "⚠️ | You cannot ban yourself!",
			cantBanAdmin: "❌ | You cannot ban a group administrator!",
			existedBan: "❌ | This user is already banned!",
			noReason: "No reason",
			bannedSuccess: "✅ | %1 has been banned!",
			needAdmin: "⚠️ | The bot must be an administrator with permission to ban users.",
			noName: "Telegram user",
			noData: "📑 | No banned members in this group.",
			listBanned: "📑 | Banned members (page %1/%2)",
			content: "%1/ %2 (%3)\nReason: %4\nBan time: %5\n\n",
			needAdminToKick: "⚠️ | %1 (%2) is banned, but the bot cannot remove them. Give the bot ban/restrict permission.",
			bannedKick: "⚠️ | %1 was already banned!\nID: %2\nReason: %3\nBan time: %4\n\nBot automatically removed this member."
		}
	},

	onStart: async function ({ message, event, args, api }) {
		const chat = event?.raw?.chat;
		if (!chat?.id)
			return message.reply("⚠️ | Telegram chat information was not received. Send /ban directly in the group.");

		if (chat.type && !["group", "supergroup"].includes(chat.type))
			return message.reply("⚠️ | This command can only be used in a group.\nChat type: " + chat.type);

		const chatId = chat.id;
		const actorId = event.senderID;
		if (!actorId)
			return message.reply("❌ | Telegram user information was not received.");

		let actor;
		try {
			actor = await api.call("getChatMember", {
				chat_id: chatId,
				user_id: Number(actorId)
			});
		}
		catch (e) {
			return message.reply("❌ | Could not verify your group administrator status.\nTelegram: " + e.message);
		}

		if (!["administrator", "creator"].includes(actor.status))
			return message.reply("❌ | Only group administrators can use this command.");

		let botMember;
		try {
			botMember = await api.call("getChatMember", {
				chat_id: chatId,
				user_id: api.getCurrentUserID()
			});
		}
		catch (e) {
			return message.reply(this.langs.en.needAdmin);
		}

		const botCanBan =
			["administrator", "creator"].includes(botMember.status)
			&& (botMember.status === "creator" || botMember.can_restrict_members === true);

		if (!botCanBan)
			return message.reply(this.langs.en.needAdmin);

		const db = global.TelegramBannedUsers || (global.TelegramBannedUsers = new Map());
		if (!db.has(String(chatId)))
			db.set(String(chatId), []);
		const dataBanned = db.get(String(chatId));

		const sub = String(args[0] || "").toLowerCase();

		if (sub === "unban") {
			const target = getTarget(event, args[1]);

			if (!target)
				return message.reply(this.langs.en.notFoundTargetUnban);

			const index = dataBanned.findIndex(item => String(item.id) === String(target.id));
			if (index === -1)
				return message.reply(this.langs.en.userNotBanned.replace("%1", target.id));

			dataBanned.splice(index, 1);

			try {
				await api.call("unbanChatMember", {
					chat_id: chatId,
					user_id: Number(target.id),
					only_if_banned: true
				});
			}
			catch (e) {
				// The database entry is still removed if the user is already unbanned.
			}

			return message.reply(
				this.langs.en.unbannedSuccess.replace("%1", getName(target))
			);
		}

		if (sub === "check") {
			if (!dataBanned.length)
				return message.reply(this.langs.en.noData);

			let kicked = 0;

			for (const user of dataBanned) {
				try {
					const member = await api.call("getChatMember", {
						chat_id: chatId,
						user_id: Number(user.id)
					});

					if (!["left", "kicked"].includes(member.status)) {
						await api.call("banChatMember", {
							chat_id: chatId,
							user_id: Number(user.id)
						});
						kicked++;
					}
				}
				catch (e) {
					// User may already have left or Telegram may not expose the member.
				}
			}

			return message.reply(`✅ | Check complete. ${kicked} banned member(s) removed.`);
		}

		if (sub === "list") {
			if (!dataBanned.length)
				return message.reply(this.langs.en.noData);

			const limit = 20;
			const page = Math.max(1, parseInt(args[1] || "1", 10) || 1);
			const totalPages = Math.max(1, Math.ceil(dataBanned.length / limit));
			const start = (page - 1) * limit;
			const data = dataBanned.slice(start, start + limit);

			let text = this.langs.en.listBanned
				.replace("%1", page)
				.replace("%2", totalPages) + "\n\n";

			for (let i = 0; i < data.length; i++) {
				const user = data[i];
				text += this.langs.en.content
					.replace("%1", start + i + 1)
					.replace("%2", user.name || this.langs.en.noName)
					.replace("%3", user.id)
					.replace("%4", user.reason || this.langs.en.noReason)
					.replace("%5", user.time);
			}

			return message.reply(text);
		}

		const target = getTarget(event, args[0]);

		if (!target)
			return message.reply(this.langs.en.notFoundTarget);

		if (String(target.id) === String(actorId))
			return message.reply(this.langs.en.cantSelfBan);

		try {
			const targetMember = await api.call("getChatMember", {
				chat_id: chatId,
				user_id: Number(target.id)
			});
			if (["administrator", "creator"].includes(targetMember.status))
				return message.reply(this.langs.en.cantBanAdmin);
		}
		catch (e) {
			// Telegram will return the actual error when the ban is attempted.
		}

		if (dataBanned.some(item => String(item.id) === String(target.id)))
			return message.reply(this.langs.en.existedBan);

		const reason = args.slice(1).join(" ") || this.langs.en.noReason;
		const time = moment()
			.tz(global.GoatBot?.config?.timeZone || "Asia/Dhaka")
			.format("HH:mm:ss DD/MM/YYYY");

		const record = {
			id: String(target.id),
			name: getName(target),
			time,
			reason
		};

		try {
			await api.call("banChatMember", {
				chat_id: chatId,
				user_id: Number(target.id)
			});
			dataBanned.push(record);

			return message.reply(
				this.langs.en.bannedSuccess.replace("%1", record.name)
			);
		}
		catch (e) {
			return message.reply(
				"❌ | Ban failed. Make sure the bot is admin and has 'Ban users' permission.\n" +
				"Telegram: " + e.message
			);
		}
	},

	onEvent: async function ({ event, api, message }) {
		if (event?.logMessageType !== "log:subscribe")
			return;

		const chatId = event.threadID;
		const db = global.TelegramBannedUsers || (global.TelegramBannedUsers = new Map());
		const dataBanned = db.get(String(chatId)) || [];

		if (!dataBanned.length)
			return;

		const addedParticipants = event.logMessageData?.addedParticipants || [];

		for (const user of addedParticipants) {
			const userId = user.userFbId;
			const banned = dataBanned.find(item => String(item.id) === String(userId));
			if (!banned)
				continue;

			const name = user.userFbName || "Telegram user";

			try {
				await api.call("banChatMember", {
					chat_id: chatId,
					user_id: Number(userId)
				});
				await message.send(
					`⚠️ | ${name} was already banned!\n` +
					`ID: ${userId}\n` +
					`Reason: ${banned.reason || "No reason"}\n` +
					`Ban time: ${banned.time}\n\n` +
					`Bot automatically removed this member.`
				);
			}
			catch (e) {
				await message.send(
					`⚠️ | ${name} (${userId}) is banned, but the bot could not remove them.\n` +
					`Give the bot administrator + Ban users permission.`
				);
			}
		}
	}
};

function getTarget(event, value) {
	const reply = event?.raw?.reply_to_message || event?.messageReply;
	if (reply?.from?.id || reply?.senderID) {
		const user = reply.from || reply;
		return {
			id: user.id || user.senderID,
			first_name: user.first_name,
			last_name: user.last_name,
			username: user.username
		};
	}

	if (value && /^-?\d+$/.test(String(value))) {
		return {
			id: Number(value),
			first_name: "Telegram user"
		};
	}

	return null;
}

function getName(user) {
	return [user.first_name, user.last_name].filter(Boolean).join(" ")
		|| (user.username ? "@" + user.username : "Telegram user");
}
