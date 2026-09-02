function getDateTime() {
    const dhaka = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka"
    });

    const d = new Date(dhaka);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let h24 = d.getHours();
    let m = d.getMinutes().toString().padStart(2, "0");
    let ampm = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12 || 12;

    let p = "";
    if (h24 >= 5 && h24 < 12) p = "সকাল";
    else if (h24 >= 12 && h24 < 15) p = "দুপুর";
    else if (h24 >= 15 && h24 < 18) p = "বিকাল";
    else p = "রাত";

    return `${days[d.getDay()]} ${p} ${h12}:${m} ${ampm} | ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function escapeHTML(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

module.exports = {
    config: {
        name: "start",
        aliases: ["s"],
        version: "5.5.5",
        author: "SK-SIDDIK-KHAN",
        role: 0,
        cooldown: 2,
        description: "Fixed time & added call system",
        category: "system",
        usePrefix: false
    },

    onStart: async function({ event, api }) {
        try {
            const chat = event.chat;
            const from = event.from;

            if (!chat || !from) return;

            const chatId = chat.id;
            const userId = from.id;

            const full_name =
                ((from.first_name || "") + " " + (from.last_name || "")).trim() ||
                "Unknown";

            const safeName = escapeHTML(full_name);
            const safeFirstName = escapeHTML(from.first_name || "User");

            const username = from.username
                ? "@" + from.username
                : "None";

            const safeUsername = escapeHTML(username);

            const userLink = from.username
                ? `https://t.me/${from.username}`
                : `tg://user?id=${userId}`;

            const time = getDateTime();

            const isGroup =
                chat.type === "group" ||
                chat.type === "supergroup";

            let memberCount = "N/A";
            let inviteLink = "N/A";

            if (isGroup) {
                try {
                    memberCount = await api.getChatMemberCount(chatId);
                } catch {}

                try {
                    const c = await api.getChat(chatId);

                    if (c.invite_link) {
                        inviteLink = c.invite_link;
                    } else if (c.username) {
                        inviteLink = `https://t.me/${c.username}`;
                    }
                } catch {}
            }

            try {
                let notify = "";

                if (isGroup) {
                    notify =
`👥 <b>GROUP START</b>
━━━━━━━━━━━━━━
👤 <b>User:</b> <a href="${userLink}">${safeName}</a>
🔗 <b>Username:</b> ${safeUsername}
🆔 <b>ID:</b> <code>${userId}</code>
━━━━━━━━━━━━━━
🏷️ <b>Group:</b> ${escapeHTML(chat.title || "Unknown")}
🆔 <b>GroupID:</b> <code>${chatId}</code>
👥 <b>Members:</b> ${memberCount}
🔗 <b>Link:</b> ${escapeHTML(inviteLink)}
━━━━━━━━━━━━━━
⏰ <b>${escapeHTML(time)}</b>`;
                } else {
                    notify =
`👤 <b>PRIVATE START</b>
━━━━━━━━━━━━━━
👤 <b>Name:</b> <a href="${userLink}">${safeName}</a>
🔗 <b>Username:</b> ${safeUsername}
🆔 <b>ID:</b> <code>${userId}</code>
━━━━━━━━━━━━━━
⏰ <b>${escapeHTML(time)}</b>`;
                }

                const adminUID = Array.isArray(global.config.adminUID)
                    ? global.config.adminUID
                    : [];

                let userPhoto = null;

                try {
                    const pic = await api.getUserProfilePhotos(userId, {
                        limit: 1
                    });

                    if (
                        pic &&
                        pic.total_count > 0 &&
                        pic.photos &&
                        pic.photos.length > 0
                    ) {
                        userPhoto = pic.photos[0][pic.photos[0].length - 1].file_id;
                    }
                } catch {}

                for (const adminId of adminUID) {
                    try {
                        if (userPhoto) {
                            await api.sendPhoto(adminId, userPhoto, {
                                caption: notify,
                                parse_mode: "HTML"
                            });
                        } else {
                            await api.sendMessage(adminId, notify, {
                                parse_mode: "HTML"
                            });
                        }
                    } catch {}
                }
            } catch {}

            const botInfo = await api.getMe();
            const botUsername = botInfo?.username || "";

            const prefix =
                global.config.botInfo?.prefix ||
                global.config.prefix ||
                "/";

            let userMsg = "";

            if (isGroup) {
                userMsg =
`✨ <b>Thanks ${safeFirstName}!</b>

╭─ 🤖 <b>Bot Info</b> ─
├ 🏷️ <b>Group:</b> ${escapeHTML(chat.title || "Unknown")}
├ 👥 <b>Members:</b> ${memberCount}
├ ⏰ <b>Time:</b> ${escapeHTML(time)}
╰───────────────────

💡 <b>${escapeHTML(prefix)}help</b> লিখুন সব কমান্ড দেখতে!

<b>📞 হেল্প লাগবে?</b> বট নিয়ে কোনো সমস্যা বা বুঝতে অসুবিধা হলে <code>${escapeHTML(prefix)}call</code> লিখে Admin কে জানান!`;
            } else {
                userMsg =
`✨ <b>আসসালামু আলাইকুম ${safeFirstName}! 👋</b>

╭─ 🤖 <b>আপনার প্রোফাইল</b> ─
├ 👤 <b>নাম:</b> ${safeName}
├ 🔗 <b>Username:</b> ${safeUsername}
├ 🆔 <b>User ID:</b> <code>${userId}</code>
├ 🌐 <b>ভাষা:</b> ${escapeHTML(from.language_code || "en")}
├ 💬 <b>Chat:</b> Private Chat
├ ⏰ <b>সময়:</b> ${escapeHTML(time)}
╰───────────────────────────

╭─ 🚀 <b>SIDDIK TG BOT কি?</b> ─
├ 🤖 <b>এটা একটা পাওয়ারফুল</b>
├ ☢️ <b>Telegram গ্রুপ ম্যানেজমেন্ট বট!</b>
├ 🎬 <b>Terabox / Video / Fun কমান্ড</b>
├ 👮 <b>Admin Tools - Warn, Ban, Mute</b>
├ 📁 <b>File Manager, Auto Filter ইত্যাদি</b>
╰───────────────────────────

<b>📚 কিভাবে আপনার গ্রুপে ব্যবহার করবেন?</b>

<b>Step 1:</b> নিচের "➕ Add Me To Group" বাটনে ক্লিক করে আপনার গ্রুপে Add করুন!

<b>Step 2:</b> গ্রুপে গিয়ে বট কে <b>Admin</b> বানান - সব Permission On করে!

<b>Step 3:</b> <b>Admin Approve:</b> আমাদের সিস্টেমে সিকিউরিটির জন্য Auto Approve Off থাকে! আপনাকে নিচের Admin বাটনে ক্লিক করে এডমিন কে বলুন আপনার গ্রুপ এর কথা Approve করবে! Approve না হওয়া পর্যন্ত বট গ্রুপে কাজ করবে না!

<b>Step 4:</b> Approve হয়ে গেলে গ্রুপে লিখুন:
<code>${escapeHTML(prefix)}start</code> বা <code>${escapeHTML(prefix)}help</code> - সব কমান্ড পেয়ে যাবেন!

<b>⚙️ কমান্ড দেখতে:</b> <code>${escapeHTML(prefix)}help</code> লিখুন - সব কমান্ড দেখতে পারবেন!

<b>📞 সাপোর্ট:</b> বট নিয়ে কোনো সমস্যা / বুঝতে অসুবিধা / মতামত থাকলে <code>${escapeHTML(prefix)}call আপনার মেসেজ</code> লিখে Admin কে জানান!
<b>Example:</b> <code>${escapeHTML(prefix)}call Bot কাজ করছে না, Help লাগবে!</code>

<b>🚀 আপডেট:</b> সবার ভালো সাপোর্ট পেলে বটে অনেক নতুন সিস্টেম & ফিউচার আপডেট আনবো 😌

👇 <b>বাটনে ক্লিক করে এখনই Add করুন!</b>`;
            }

            const buttons = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "➕ Add Me To Group 🚀",
                                url: `https://t.me/${botUsername}?startgroup=true`
                            },
                            {
                                text: "📢 Add To Channel",
                                url: `https://t.me/${botUsername}?startchannel=true`
                            }
                        ],
                        [
                            {
                                text: "👑 Admin - SK SIDDIK",
                                url: "https://t.me/busy1here"
                            }
                        ]
                    ]
                }
            };

            if (!isGroup) {
                try {
                    const userPhotos = await api.getUserProfilePhotos(userId, {
                        limit: 1
                    });

                    if (
                        userPhotos &&
                        userPhotos.total_count > 0 &&
                        userPhotos.photos &&
                        userPhotos.photos.length > 0
                    ) {
                        const fileId =
                            userPhotos.photos[0][userPhotos.photos[0].length - 1].file_id;

                        await api.sendPhoto(chatId, fileId, {
                            caption: userMsg,
                            parse_mode: "HTML",
                            ...buttons
                        });

                        return;
                    }
                } catch {}
            }

            await api.sendMessage(chatId, userMsg, {
                parse_mode: "HTML",
                ...buttons
            });

        } catch (e) {
            console.log("start.js error:", e.message);
        }
    }
};