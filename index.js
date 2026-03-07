const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const SCOREBOARD_CHANNEL = "FOREST_CHANNEL_ID";
let scoreboardMessage = null;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let data = JSON.parse(fs.readFileSync("./data.json", "utf8"));

function saveData() {
  async function updateForestHeart(client) {
  const channel = await client.channels.fetch(SCOREBOARD_CHANNEL);

  if (!scoreboardMessage) {
    const messages = await channel.messages.fetch({ limit: 10 });
    scoreboardMessage = messages.find(m => m.author.id === client.user.id);
  }

  if (!scoreboardMessage) return;

  await scoreboardMessage.edit(`💚🌳 **Heart of the Forest** 🌳💚

🧚‍♀️✨ Sprite Magic: ${data.server.sprites}
👹🍂 Gremlin Mischief: ${data.server.gremlins}

🌳 The forest listens... 💚👂✨`);
}
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

client.once("ready", () => {
  console.log("🌳 Heart of the Forest awakens...");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  if (!data.users[userId]) {
    data.users[userId] = {
      faction: null,
      points: 0,
      level: 1,
    };
  }

  const user = data.users[userId];

  // 🌳 AWAKEN
  if (message.content === "!awaken") {
    if (user.faction) {
      return message.reply("🌳 You have already awakened.");
    }

    return message.reply(
`🌳 The forest stirs...

Type **!whisper** to awaken as a 🧚‍♀️ Spellbound Sprite
Type **!rustle** to awaken as a 👹 Feral Gremlin`
    );
  }

  // 🧚‍♀️ WHISPER (Sprites)
  if (message.content === "!whisper") {

    if (user.faction === null) {
      user.faction = "sprite";
      user.points += 1;

      data.server.sprites += 1;
      saveData();

      return message.reply(
`🌳 Moon Wanderer fades away...
You awaken as a **🧚‍♀️ Spellbound Sprite**

🧚‍♀️ Sprite magic flickers through the trees`
      );
    }

    if (user.faction !== "sprite") {
      return message.reply("🌳 You are a 👹 Feral Gremlin. Sprite magic ignores you.");
    }

    user.points += 1;
    data.server.sprites += 1;

    saveData();

    return message.reply("🧚‍♀️ Sprite magic flickers through the trees");
  }

  // 👹 RUSTLE (Gremlins)
  if (message.content === "!rustle") {

    if (user.faction === null) {
      user.faction = "gremlin";
      user.points += 1;

      data.server.gremlins += 1;
      saveData();

      return message.reply(
`🌳 Moon Wanderer fades away...
You awaken as a **👹 Feral Gremlin**

🍂 Gremlins rustle through the underbrush`
      );
    }

    if (user.faction !== "gremlin") {
      return message.reply("🌳 You are a 🧚‍♀️ Spellbound Sprite. Gremlin chaos rejects you.");
    }

    user.points += 1;
    data.server.gremlins += 1;

    saveData();

    return message.reply("🍂 Gremlins rustle through the underbrush");
  }

  // 🌳 HEART (Scoreboard)
  if (message.content === "!heart") {

    return message.reply(
`🌳 **Heart of the Forest** 🌳

🧚‍♀️ Spellbound Sprites: ${data.server.sprites}
👹 Feral Gremlins: ${data.server.gremlins}`
    );
  }

  // 🌳 NATURE (Personal stats)
  if (message.content === "!nature") {

    const factionName =
      user.faction === "sprite"
        ? "🧚‍♀️ Spellbound Sprite"
        : user.faction === "gremlin"
        ? "👹 Feral Gremlin"
        : "🌙 Moon Wanderer";

    return message.reply(
`🌳 **Your True Nature** 🌳

Faction: ${factionName}
Points: ${user.points}
Level: ${user.level}`
    );
  }

});

client.login(process.env.DISCORD_TOKEN);
