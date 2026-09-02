const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "daily",
		version: "1.2",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Nhận quà hàng ngày",
			en: "Receive daily gift"
		},
		category: "game",
		guide: {
			vi: "   {pn}: Nhận quà hàng ngày\n   {pn} info: Xem thông tin quà hàng ngày",
			en: "   {pn}: Receive daily gift\n   {pn} info: View daily gift information"
		},
		envConfig: {
			rewardFirstDay: {
				coin: 100,
				exp: 10
			}
		}
	},

	langs: {
		vi: {
			monday: "Thứ 2",
			tuesday: "Thứ 3",
			wednesday: "Thứ 4",
			thursday: "Thứ 5",
			friday: "Thứ 6",
			saturday: "Thứ 7",
			sunday: "Chủ nhật",
			alreadyReceived: "Bạn đã nhận quà rồi",
			received: "Bạn đã nhận được %1 coin và %2 exp"
		},
		en: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
			alreadyReceived: "You have already received the gift",
			received: "You have received %1 coin and %2 exp"
		}
	},

	onStart: async function ({
		args,
		message,
		event,
		envCommands,
		usersData,
		commandName,
		getLang
	}) {
		try {
			const reward = envCommands[commandName]?.rewardFirstDay || {
				coin: 100,
				exp: 10
			};

			if (args[0]?.toLowerCase() === "info") {
				let msg = "";

				for (let i = 1; i <= 7; i++) {
					const getCoin = Math.floor(
						reward.coin * Math.pow(1.2, i - 1)
					);

					const getExp = Math.floor(
						reward.exp * Math.pow(1.2, i - 1)
					);

					const days = [
						"",
						"monday",
						"tuesday",
						"wednesday",
						"thursday",
						"friday",
						"saturday",
						"sunday"
					];

					const day = getLang(days[i]);

					msg += `${day}: ${getCoin} coin, ${getExp} exp\n`;
				}

				return message.reply(msg.trim());
			}

			const { senderID } = event;
			const dateTime = moment
				.tz("Asia/Dhaka")
				.format("DD/MM/YYYY");

			const userData = await usersData.get(senderID);

			if (!userData) {
				return message.reply("User data not found.");
			}

			const data = userData.data || {};

			if (data.lastTimeGetReward === dateTime) {
				return message.reply(getLang("alreadyReceived"));
			}

			const currentDay = moment
				.tz("Asia/Dhaka")
				.day();

			const dayIndex = currentDay === 0 ? 7 : currentDay;

			const getCoin = Math.floor(
				reward.coin * Math.pow(1.2, dayIndex - 1)
			);

			const getExp = Math.floor(
				reward.exp * Math.pow(1.2, dayIndex - 1)
			);

			data.lastTimeGetReward = dateTime;

			const currentMoney = Number(userData.money) || 0;
			const currentExp = Number(userData.exp) || 0;

			await usersData.set(senderID, {
				money: currentMoney + getCoin,
				exp: currentExp + getExp,
				data
			});

			return message.reply(
				getLang("received", getCoin, getExp)
			);
		} catch (error) {
			console.error("[DAILY ERROR]", error);

			return message.reply(
				"An error occurred while claiming your daily reward."
			);
		}
	}
};