const request = require("request");
const {
	createReadStream,
	createWriteStream,
	existsSync
} = require("fs-extra");
const path = require("path");

async function emojiEdit(api, threadID, emojis, delay = 700) {
	return new Promise(resolve => {
		api.sendMessage(emojis[0], threadID, async (err, info) => {
			if (err || !info?.messageID) return resolve(null);

			const msgID = info.messageID;

			for (let i = 1; i < emojis.length; i++) {
				await new Promise(r => setTimeout(r, delay));
				await api.editMessage(emojis[i], msgID);
			}

			resolve(msgID);
		});
	});
}

async function animatedMenu(api, threadID, frames, delay = 500) {
	return new Promise(resolve => {
		api.sendMessage(frames[0], threadID, async (err, info) => {
			if (err || !info?.messageID) return resolve(null);

			const msgID = info.messageID;

			for (let i = 1; i < frames.length; i++) {
				await new Promise(r => setTimeout(r, delay));
				await api.editMessage(frames[i], msgID);
			}

			resolve(msgID);
		});
	});
}

function formatMoney(amount) {
	amount = Number(amount) || 0;

	if (amount >= 1e15)
		return (amount / 1e15).toFixed(2).replace(/\.00$/, "") + "Q";
	if (amount >= 1e12)
		return (amount / 1e12).toFixed(2).replace(/\.00$/, "") + "T";
	if (amount >= 1e9)
		return (amount / 1e9).toFixed(2).replace(/\.00$/, "") + "B";
	if (amount >= 1e6)
		return (amount / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
	if (amount >= 1e3)
		return (amount / 1e3).toFixed(2).replace(/\.00$/, "") + "K";

	return amount.toLocaleString("en-US");
}

module.exports = {
	config: {
		name: "casino",
		version: "2.1.0",
		author: "Azadx69x",
		role: 0,
		countDown: 3,
		category: "games",
		guide: {
			en:
				"{pn} casino\n" +
				"{pn} casino big 100\n" +
				"{pn} casino small 100\n" +
				"{pn} casino even 100\n" +
				"{pn} casino odd 100\n" +
				"{pn} casino lottery 50 100\n" +
				"{pn} casino difference 50 100\n" +
				"{pn} casino slot 100"
		}
	},

	onStart: async function ({
		message,
		event,
		args,
		usersData
	}) {
		const {
			threadID,
			senderID
		} = event;

		try {
			const userData = await usersData.get(senderID);

			if (!userData) {
				return message.reply("❌ Account data not found.");
			}

			const money = Number(userData.money) || 0;
			const choose = args[0]?.toLowerCase();
			const value = Number(args[1]);
			const betAmount = Number(args[2]);

			const imgPath = path.join(
				__dirname,
				"cache",
				"casino.png"
			);

			if (!existsSync(imgPath)) {
				try {
					request("https://files.catbox.moe/ijl2ub.png")
						.pipe(createWriteStream(imgPath));
				} catch (e) {}
			}

			if (!choose) {
				const menuFrames = [
					`🎰 ── WELCOME TO CASINO ── 🎰

🎲 1. Big / Small
🎴 2. Even / Odd
💸 3. Lottery
🎫 4. Difference
🍒 5. Slot

💡 Reply with the number of the game
💰 Minimum bet: 50$`,

					`🎰 ── WELCOME TO CASINO ── 🎰

🎲 1. Big / Small
🎴 2. Even / Odd
💸 3. Lottery
🎫 4. Difference
🍒 5. Slot

✨ Reply with the number to start! 💰`,

					`🎰 ── WELCOME TO CASINO ── 🎰

🎲 1. Big / Small
🎴 2. Even / Odd
💸 3. Lottery
🎫 4. Difference
🍒 5. Slot

💡 Ready? Type the number! 💰`
				];

				const msgID = await animatedMenu(
					threadID,
					threadID,
					menuFrames,
					500
				);

				if (msgID) {
					global.GoatBot.onReply.set(msgID, {
						commandName: "casino",
						author: senderID,
						type: "choose"
					});
				}

				return;
			}

			if (
				choose === "big" ||
				choose === "small"
			) {
				const bet = value;

				if (!Number.isFinite(bet) || bet < 50) {
					return message.reply(
						"❌ Minimum bet is 50$."
					);
				}

				if (money < bet) {
					return message.reply(
						`❌ Not enough money.\n💰 Balance: ${formatMoney(money)}`
					);
				}

				const loadID = await emojiEdit(
					threadID,
					threadID,
					["🎲", "🎲 🎲", "🎲 🎲 🎲"],
					500
				);

				const result =
					Math.random() < 0.5
						? "big"
						: "small";

				let newBalance;

				if (choose === result) {
					newBalance = money + bet;
					await usersData.set(senderID, {
						money: newBalance
					});

					return apiEdit(
						`🎉 YOU WON\nResult: ${result}\n+${formatMoney(bet)}$\n💰 Balance: ${formatMoney(newBalance)}`,
						loadID
					);
				}

				newBalance = money - bet;

				await usersData.set(senderID, {
					money: newBalance
				});

				return apiEdit(
					`😢 YOU LOST\nResult: ${result}\n-${formatMoney(bet)}$\n💰 Balance: ${formatMoney(newBalance)}`,
					loadID
				);
			}

			if (
				choose === "even" ||
				choose === "odd"
			) {
				const bet = value;

				if (!Number.isFinite(bet) || bet < 50) {
					return message.reply(
						"❌ Minimum bet is 50$."
					);
				}

				if (money < bet) {
					return message.reply(
						`❌ Not enough money.\n💰 Balance: ${formatMoney(money)}`
					);
				}

				const loadID = await emojiEdit(
					threadID,
					threadID,
					["🎴", "🎴 ➡️", "🎴 ➡️ 🎴"],
					500
				);

				const num =
					Math.floor(Math.random() * 10) + 1;

				const result =
					num % 2 === 0
						? "even"
						: "odd";

				let newBalance;

				if (choose === result) {
					newBalance = money + bet;

					await usersData.set(senderID, {
						money: newBalance
					});

					return apiEdit(
						`🎉 YOU WON\nNumber: ${num}\n+${formatMoney(bet)}$\n💰 Balance: ${formatMoney(newBalance)}`,
						loadID
					);
				}

				newBalance = money - bet;

				await usersData.set(senderID, {
					money: newBalance
				});

				return apiEdit(
					`😢 YOU LOST\nNumber: ${num}\n-${formatMoney(bet)}$\n💰 Balance: ${formatMoney(newBalance)}`,
					loadID
				);
			}

			if (choose === "lottery") {
				const lotteryNumber = value;
				const bet = betAmount;

				if (
					!Number.isInteger(lotteryNumber) ||
					lotteryNumber < 0 ||
					lotteryNumber > 99 ||
					!Number.isFinite(bet) ||
					bet < 50
				) {
					return message.reply(
						"❌ Usage: {pn}casino lottery [0-99] [amount]\nMinimum bet: 50$"
					);
				}

				if (money < bet) {
					return message.reply(
						`❌ Not enough money.\n💰 Balance: ${formatMoney(money)}`
					);
				}

				const loadID = await emojiEdit(
					threadID,
					threadID,
					["💸", "💸 💸", "💸 💸 💸"],
					300
				);

				const lottery =
					Math.floor(Math.random() * 100);

				if (lotteryNumber === lottery) {
					const newBalance =
						money + bet * 2;

					await usersData.set(senderID, {
						money: newBalance
					});

					return apiEdit(
						`🎉 YOU WON\nResult: ${lottery}\n+${formatMoney(bet * 2)}$\n💰 Balance: ${formatMoney(newBalance)}`,
						loadID
					);
				}

				const newBalance = money - bet;

				await usersData.set(senderID, {
					money: newBalance
				});

				return apiEdit(
					`😢 YOU LOST\nResult: ${lottery}\n-${formatMoney(bet)}$\n💰 Balance: ${formatMoney(newBalance)}`,
					loadID
				);
			}

			if (choose === "difference") {
				const selected = value;
				const bet = betAmount;

				if (
					!Number.isInteger(selected) ||
					selected < 0 ||
					selected > 9 ||
					!Number.isFinite(bet) ||
					bet < 50
				) {
					return message.reply(
						"❌ Usage: {pn}casino difference [0-9] [amount]\nMinimum bet: 50$"
					);
				}

				if (money < bet) {
					return message.reply(
						`❌ Not enough money.\n💰 Balance: ${formatMoney(money)}`
					);
				}

				const loadID = await emojiEdit(
					threadID,
					threadID,
					["🎫", "🎫 ➡️", "🎫 ➡️ 🎫"],
					400
				);

				const result =
					Math.floor(Math.random() * 10);

				const difference =
					Math.abs(selected - result);

				let multiplier = 0;

				if (difference === 0) {
					multiplier = 5;
				} else if (difference === 1) {
					multiplier = 3;
				} else if (difference === 2) {
					multiplier = 2;
				}

				if (multiplier > 0) {
					const reward = bet * multiplier;
					const newBalance =
						money + reward;

					await usersData.set(senderID, {
						money: newBalance
					});

					return apiEdit(
						`🎉 YOU WON\nResult: ${result}\nDifference: ${difference}\n+${formatMoney(reward)}$\n💰 Balance: ${formatMoney(newBalance)}`,
						loadID
					);
				}

				const newBalance = money - bet;

				await usersData.set(senderID, {
					money: newBalance
				});

				return apiEdit(
					`😢 YOU LOST\nResult: ${result}\nDifference: ${difference}\n-${formatMoney(bet)}$\n💰 Balance: ${formatMoney(newBalance)}`,
					loadID
				);
			}

			if (choose === "slot") {
				const bet = value;

				if (!Number.isFinite(bet) || bet < 50) {
					return message.reply(
						"❌ Minimum bet is 50$."
					);
				}

				if (money < bet) {
					return message.reply(
						`❌ Not enough money.\n💰 Balance: ${formatMoney(money)}`
					);
				}

				const items = [
					"🍒",
					"🍉",
					"🍊",
					"🍏",
					"🍓",
					"🍌"
				];

				const loadID = await emojiEdit(
					threadID,
					threadID,
					[
						"🎰",
						"🎰 🎲",
						"🎰 🎲 🎰",
						"🎰 🎲 🎰 🎲"
					],
					600
				);

				const a =
					Math.floor(Math.random() * items.length);
				const b =
					Math.floor(Math.random() * items.length);
				const c =
					Math.floor(Math.random() * items.length);

				const win =
					a === b ||
					b === c ||
					a === c;

				const reward = win ? bet * 2 : 0;
				const newBalance =
					money - bet + reward;

				await usersData.set(senderID, {
					money: newBalance
				});

				return apiEdit(
					`🎰 ${items[a]} | ${items[b]} | ${items[c]} 🎰\n` +
					`${win
						? `🎉 YOU WON +${formatMoney(reward)}$`
						: `😢 YOU LOST -${formatMoney(bet)}$`}\n` +
					`💰 Balance: ${formatMoney(newBalance)}`,
					loadID
				);
			}

			return message.reply(
				"❌ Invalid casino game.\nUse {pn}casino to see the menu."
			);
		} catch (error) {
			console.error("[CASINO ERROR]", error);
			return message.reply(
				"❌ Casino error. Please try again."
			);
		}
	},

	onReply: async function ({
		message,
		event,
		Reply
	}) {
		if (
			String(event.senderID) !==
			String(Reply.author)
		) {
			return;
		}

		const guide = {
			"1": "casino big 100",
			"2": "casino even 100",
			"3": "casino lottery 50 100",
			"4": "casino difference 5 100",
			"5": "casino slot 100"
		};

		const option =
			event.body?.toString().trim();

		if (!guide[option]) {
			return message.reply("❌ Invalid option.");
		}

		return message.reply(
			`Use: ${global.GoatBot.config.prefix}${guide[option]}`
		);
	}
};

async function apiEdit(text, messageID) {
	if (!messageID) return;

	const api = global.GoatBot?.api;

	if (api) {
		return api.editMessage(text, messageID);
	}
}