const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "file",
		version: "1.0",
		author: "xnil6x",
		countDown: 5,
		role: 2,
		shortDescription: "Send bot script",
		longDescription: "Send specified file as a document",
		category: "owner",
		guide: {
			en: "{pn} <file path>\nExample: {pn} scripts/cmds/curl.js"
		}
	},

	onStart: async function ({ message, args, event }) {
		try {
			const filePath = args.join(" ");

			if (!filePath) {
				return message.reply(
					"❌ Please provide a file path.\n\nExample:\n{pn} scripts/cmds/curl.js"
				);
			}

			const absolutePath = path.resolve(filePath);

			if (!fs.existsSync(absolutePath)) {
				return message.reply(
					`❌ File not found:\n${filePath}`
				);
			}

			if (!fs.statSync(absolutePath).isFile()) {
				return message.reply(
					"❌ The specified path is not a file."
				);
			}

			return message.reply({
				body: `📄 ${path.basename(absolutePath)}`,
				attachment: fs.createReadStream(absolutePath)
			});
		} catch (error) {
			console.error("[FILE ERROR]", error);

			return message.reply(
				"❌ Failed to send the file."
			);
		}
	}
};