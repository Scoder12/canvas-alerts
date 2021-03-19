import { Client } from "discord.js";

const client = new Client();

client.on("message", (msg) => {
  if (msg.channel.type !== "dm") return;
  if (msg.content === "Hello") {
    msg.channel.send(`Hello, <@${msg.author.id}>`);
  }
});

client.on("ready", () => {
  console.log("Bot logged in");
});

client.login(process.env.TOKEN);
