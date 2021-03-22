import { Client } from "discord.js";
import fetch from "node-fetch";

const client = new Client();

client.on("message", async (msg) => {
  if (msg.channel.type !== "dm" || msg.author.id === client.user?.id) return;
  if (msg.content === "Hello") {
    msg.channel.send(`Hello, <@${msg.author.id}>`);
  }
  if (msg.content === "AC") {
    msg.channel.send("");
  }
  if (msg.content.toLowerCase().startsWith("weather ")) {
    let foo = msg.content.split(" ");
    foo.shift();
    const cityname = foo.join("_");
    const r = await fetch(`https://wttr.in/${cityname}?format=j1`);
    const api = await r.json();
    const location = api["nearest_area"][0]["areaName"][0]["value"];
    const location_region = api["nearest_area"][0]["region"][0]["value"];
    const feels_like = api["current_condition"][0]["FeelsLikeF"];
    const weather_desc = api["current_condition"][0]["weatherDesc"][0]["value"];
    const sunset = api["weather"][0]["astronomy"][0]["sunset"];
    const sunrise = api["weather"][0]["astronomy"][0]["sunrise"];

    msg.channel.send(`Location: ${location}, ${location_region}
    Feels like: ${feels_like}°F
    Weather Description: ${weather_desc}
    Sunrise: ${sunrise}
    Sunset: ${sunset}
    `);
  }
});

client.on("ready", () => {
  console.log("Bot logged in");
});

client.login(process.env.TOKEN);
