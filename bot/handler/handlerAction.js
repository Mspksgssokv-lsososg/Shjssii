const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

const request = require("request")
const axios = require("axios")
const fs = require("fs-extra")


module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
	const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	return async function (event) {
		const message = createFuncMessage(api, event);

		await handlerCheckDB(usersData, threadsData, event);
		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat)
			return;

		const { onStart, onChat, onReply, onEvent, handlerEvent, onReaction, typ, presence, read_receipt } = handlerChat;

		switch (event.type) {
      case "callback_query": {
        try {
          await api.answerCallbackQuery?.(event.callbackQueryID, "✅");
        } catch (_) {}

        const data = String(event.callbackData || "");

        // cmd:<command> [args] -> execute the normal command pipeline.
        if (data.startsWith("cmd:")) {
          const commandText = data.slice(4).trim();
          const prefix = global.utils.getPrefix(event.threadID);
          const syntheticEvent = {
            ...event,
            type: "message",
            body: prefix + commandText,
            raw: event.raw?.message || event.raw,
            isReply: false
          };
          await handlerAction(syntheticEvent);
          return;
        }

        // button:<command>:<payload> -> call an optional command onButton handler.
        if (data.startsWith("button:")) {
          const parts = data.slice(7).split(":");
          const commandName = (parts.shift() || "").toLowerCase();
          const command = global.GoatBot.commands.get(commandName) ||
            global.GoatBot.commands.get(global.GoatBot.aliases.get(commandName));

          if (!command) return;

          if (typeof command.onButton === "function") {
            const buttonMessage = createFuncMessage(api, event);
            await command.onButton({
              api,
              event,
              message: buttonMessage,
              args: parts,
              commandName: command.config.name,
              data: parts.join(":")
            });
          }
        }
        return;
      }
			case "message":
			case "message_reply":
			case "message_unsend":
				onChat();
				onStart();
				onReply();
        if(event.type == "message_unsend"){
          
          let resend = await threadsData.get(event.threadID, "settings.reSend");
		if (resend == true && event.senderID 
!== api.getCurrentUserID()){
      let umid = global.reSend[event.threadID].findIndex(e => e.messageID === event.messageID)
      
      if(umid>(-1)){
let nname = await usersData.getName(event.senderID)
        let attch = []
if(global.reSend[event.threadID][umid].attachments.length>0){
  let cn = 0
  for(var abc of global.reSend[event.threadID][umid].attachments){
   if(abc.type == "audio"){
    
    cn += 1;

   let pts = `scripts/cmds/tmp/${cn}.mp3`
					let res2 = (await axios.get(abc.url, {
						responseType: "arraybuffer"
					})).data;
			fs.writeFileSync(pts, Buffer.from(res2, "utf-8"))
    
  attch.push(fs.createReadStream(pts))} else{
     attch.push(await global.utils.getStreamFromURL(abc.url))
  }
  }
}
        
  api.sendMessage({body: nname + " removed:\n\n" + global.reSend[event.threadID][umid].body,
mentions:[{id:event.senderID, tag:nname}],
    attachment:attch
                  }, event.threadID)
                   

  
      }
    }
        }
				break;
			case "event":
				handlerEvent();
				onEvent();
				break;
			case "message_reaction":
				onReaction();
        if(event.reaction == ""){
  if(event.userID == "100033670741301","61571904047861"){
api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
                if (err) return console.log(err);
              });

}else{
    message.send(":)")
  }
  }
        if(event.reaction ==  "😾"){
  if(event.senderID == api.getCurrentUserID()){if(event.userID == "61575011217788","100083520680035"){
    message.unsend(event.messageID)
}else{
    message.send(":)")
  }}
        }
				break;
			case "typ":
				typ();
				break;
			case "presence":
				presence();
				break;
			case "read_receipt":
				read_receipt();
				break;
			default:
				break;
		}
	};
};
