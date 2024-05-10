import { Bot, webhookCallback } from "grammy";
import { UserFromGetMe } from "grammy/types";

export interface Env {
  BOT_TOKEN: string;
}

let botInfo: UserFromGetMe | undefined = undefined;

export default {
  async fetch(request: Request, env: Env) {
    try {
      const bot = new Bot(env.BOT_TOKEN, { botInfo });

      if (botInfo === undefined) {
        await bot.init();
        botInfo = bot.botInfo;
      }

      bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
      bot.on("message:text", (ctx) => { ctx.reply("Got a text message!") });
      bot.on("message:voice", async (ctx) => {
        // Get fileID from the voice message
        const fileId = ctx.message.voice.file_id;
        // Get the file URL
        const fileUrl = await ctx.api.getFile(fileId);
        // Get the URL of the file
        const file_path = fileUrl.file_path;
        if (!file_path) {
          throw new Error("No file path found");
        }
        // https://api.telegram.org/file/bot<token>/<file_path>
        const fullUrl = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file_path}`;
        if (file_path) {
          console.log(fullUrl);
        }
        await ctx.reply(`Got a voice message!: ${file_path}`)
      });

      const cb = webhookCallback(bot, "cloudflare-mod");
      console.log("Request received");
      return await cb(request);
    } catch (e: any) {
      console.error(e);
      return new Response(e.message);
    }
  },
}