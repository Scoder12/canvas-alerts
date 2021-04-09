import { Client } from "discord.js";
import fetch from "node-fetch";

const client = new Client();

const maxAssignmentTime = 1000 * 60 * 60 * 24 * 7;
interface Assignment {
  has_submitted_submissions: boolean;
  due_at: string;
}
interface Course {
  id: number;
}

async function getApi(route: string, param: string) {
  const r = await fetch(
    `https://${process.env.CANVAS_URL}${route}?access_token=${process.env.CANVAS_KEY}&per_page=999${param}`
  );
  return await r.json();
}

async function canvas() {
  const classes: Course[] = await getApi(`/api/v1/courses`, "");
  console.log(classes);
  const assignments = await Promise.all(
    classes.map(async ({ id }) => {
      const api: Assignment[] = await getApi(
        `/api/v1/courses/${id}/assignments`,
        `&bucket=future`
      );
      return api.filter(({ due_at }) => {
        const dueDate = Date.parse(due_at);
        if (isNaN(dueDate)) {
          return false;
        }
        const timeFromNow = dueDate - Date.now();
        return timeFromNow < maxAssignmentTime;
      });
    })
  );
  return assignments.flat();
}
canvas().then(console.log);

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
