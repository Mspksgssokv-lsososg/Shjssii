module.exports = {
config: {
name: "pp",
aliases: ["avatar", "pfp", "profilepic"],
author: "SK-SIDDIK-KHAN",
version: "1.0",
cooldown: 5,
role: 0,
description: "Get user profile picture (own, reply, or mention)",
category: "utility",
usePrefix: true
},

onStart: async function ({ event, api, message }) {
try {
let targetUser = null;
let userId = null;

  if (event.reply_to_message?.from) {
    targetUser = event.reply_to_message.from;
    userId = targetUser.id;
  } else if (
    event.entities?.some(e => e.type === "text_mention" && e.user)
  ) {
    const mention = event.entities.find(
      e => e.type === "text_mention" && e.user
    );

    targetUser = mention.user;
    userId = targetUser.id;
  } else {
    targetUser = event.from;
    userId = targetUser?.id;
  }

  if (!userId) {
    return message.reply(
      "❌ Could not find user. Please reply to a message or mention a user."
    );
  }

  const userName =
    `${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim() ||
    "Unknown User";

  const photos = await api.getUserProfilePhotos(userId, {
    limit: 1
  });

  if (!photos?.photos?.length) {
    return message.reply(
      `⚠️ ${userName} has no profile picture.`
    );
  }

  const photoList = photos.photos[0];

  if (!photoList?.length) {
    return message.reply(
      `⚠️ ${userName} has no profile picture.`
    );
  }

  const photo = photoList[photoList.length - 1];

  await api.sendPhoto(event.chat.id, photo.file_id, {
    caption:
      `📸 Profile Picture of ${userName}\n` +
      `🆔 User ID: ${userId}`,
    reply_to_message_id: event.message_id
  });

} catch (error) {
  if (global.log?.error) {
    global.log.error("Error in pp command:", error);
  } else {
    console.error("Error in pp command:", error);
  }

  return message.reply(
    `❌ Error: ${error.message || "Unknown error"}`
  );
}

}
};