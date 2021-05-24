import { Client } from "discord.js";
// import { htmlToText } from "html-to-text";
import fetch from "node-fetch";
import Database from "@replit/database";

const db = new ((Database as unknown) as typeof import("@replit/database").Client)();

const client = new Client();

const maxAssignmentTime = 1000 * 60 * 60 * 24 * 7;
interface Assignment {
  has_submitted_submissions: boolean;
  due_at: string;
  description: string;
  name: string;
  html_url: string;
}
interface Course {
  id: number;
  name: string;
}
type AssignmentWithName = Assignment & { className: string };

async function getApi(route: string, param: string, auth: string) {
  const r = await fetch(
    `https://${process.env.CANVAS_URL}${route}?access_token=${auth}&per_page=999${param}`
  );
  return await r.json();
}

async function getAllAssignments(auth: string): Promise<AssignmentWithName[]> {
  const classes: Course[] = await getApi(`/api/v1/courses`, "", auth);
  // console.log(classes);
  const assignments = await Promise.all(
    classes.map(async ({ id, name }) => {
      const api: Assignment[] = await getApi(
        `/api/v1/courses/${id}/assignments`,
        `&bucket=future`,
        auth
      );
      return api
        .filter(({ due_at }) => {
          const dueDate = Date.parse(due_at);
          if (isNaN(dueDate)) {
            return false;
          }
          const timeFromNow = dueDate - Date.now();
          return timeFromNow < maxAssignmentTime;
        })
        .map((a) => ({ className: name, ...a }));
    })
  );
  return assignments.flat();
}
//getAllAssignments().then((assignments: AssignmentWithName[]) =>
//  console.log(assignments.map(messageGen))
//);

function messageGen({
  // description,
  name,
  due_at,
  // html_url,
  className,
}: AssignmentWithName) {
  return `${className} Assignment ${name} is due at ${due_at}`;
}

client.on("message", async (msg) => {
  if (msg.channel.type !== "dm" || msg.author.id === client.user?.id) return;
  if (msg.content === "Hello") {
    msg.channel.send(`Hello, <@${msg.author.id}>`);
  } else if (msg.content === "AC") {
    msg.channel.send("");
  } else if (msg.content.toLowerCase().startsWith("weather ")) {
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
  } else if (msg.content.startsWith("register")) {
    let args = msg.content.split(" ");
    let auth = args[1];
    if (!auth) {
      msg.channel.send("Error please provide your auth token.");
      return;
    }
    await db.set(msg.author.id, auth);
    msg.channel.send("Auth set correctly, Bravo!!!");
  } else if (msg.content.startsWith("assignments")) {
    const auth = (await db.get(msg.author.id)) as string;
    if (!auth) {
      msg.channel.send("Error please provide your auth token.");
      return;
    }
    msg.channel.send("loading..........");
    getAllAssignments(auth)
      .then((assignments: AssignmentWithName[]) => {
        msg.channel.send(assignments.map(messageGen));
      })
      .catch(() => msg.channel.send("Please provide a valid token"));
  } else if (msg.content == "help") {
    msg.channel.send(`Welcome to Spencer and Finn's canvas Assignment Bot
Step 1 to using this bot is going to ${process.env.CANVAS_URL} and then clicking on your acount then settings
from there you  need to scroll down till you see Approved Integrations and then press the blue "New Access Token" button.
From there you will input a purpose(This can be whatever) then inpute the experation date(When it expires you will have to make a new one)
then click generate token, BE SURE NOT TO CLOSE OUT OF THIS BEFORE YOU COPY YOUR TOKEN(make sure to save this somewhere, and dont let others access it.)
Step 2 type register followed by your token
Step 3 type assignments`);
  }
});

client.on("ready", () => {
  console.log("Bot logged in");
});

client.login(process.env.TOKEN);
