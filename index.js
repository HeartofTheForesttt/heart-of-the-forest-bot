const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const SCOREBOARD_CHANNEL = "1479448918071836764";

let scoreboardMessage = null;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Create data file if it doesn't exist
if (!fs.existsSync("./data.json")) {
  fs.writeFileSync(
    "./data.json",
    JSON.stringify({
      server: { sprites: 0, gremlins: 0 },
      users: {}
    }, null, 2)
  );
}

// Load data
let data = JSON.parse(fs.readFileSync("./data.json", "utf8"));

function saveData() {
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

async function updateForestHeart() {
  const channel = await client.channels.fetch(SCOREBOARD_CHANNEL);

  if (!scoreboardMessage) {
    const messages = await channel.messages.fetch({ limit: 10 });
    scoreboardMessage = messages.find(m => m.author.id === client.user.id);
  }

  if (!scoreboardMessage) return;

  await scoreboardMessage.edit(`💚🌳 **Heart of the Forest** 🌳💚

🧚‍♀️ Sprite Magic: ${data.server.sprites}
👹 Gremlin Mischief: ${data.server.gremlins}

🌳 The forest listens... 💚👂✨`);
}

client.once("ready", () => {
  console.log("🌳 Heart of the Forest awakens...");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  if (!data.users[userId]) {
    data.users[userId] = {
      faction: "moon",
      points: 0,
      level: 1
    };
  }

  const user = data.users[userId];

  // CREATE SCOREBOARD
  if (message.content === ".heart") {
    const channel = await client.channels.fetch(SCOREBOARD_CHANNEL);

    scoreboardMessage = await channel.send(`💚🌳 **Heart of the Forest** 🌳💚

🧚‍♀️ Sprite Magic: ${data.server.sprites}
👹 Gremlin Mischief: ${data.server.gremlins}

🌳 The forest listens... 💚👂✨`);

    return;
  }

  // SPRITE POINT
  if (message.content === ".whisper") {
    data.server.sprites += 1;
    user.points += 1;

    saveData();
    await updateForestHeart();

    return message.reply("🧚‍♀️ A sprite whisper echoes through the canopy...");
  }

  // GREMLIN POINT
  if (message.content === ".rustle") {
    data.server.gremlins += 1;
    user.points += 1;

    saveData();
    await updateForestHeart();

    return message.reply("👹 Gremlins rustle through the undergrowth...");
  }

  // PERSONAL STATS
  if (message.content === ".nature") {
    let factionName =
      user.faction === "sprite"
        ? "🧚 Spellbound Sprite"
        : user.faction === "gremlin"
        ? "👹 Feral Gremlin"
        : "🌙 Moon Wanderer";

    return message.reply(`🌳 **Your True Nature**

Faction: ${factionName}
Points: ${user.points}
Level: ${user.level}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
