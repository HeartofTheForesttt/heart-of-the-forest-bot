const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const SCOREBOARD_CHANNEL = "PASTE_YOUR_FOREST_HEART_CHANNEL_ID";
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
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

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

client.once("ready", () => {
  console.log("🌳 Heart of the Forest awakens...");
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  const userId = message.author.id;

  if (!data.users[userId]) {
    data.users[userId] = {
      faction: "wanderer",
      points: 0,
      level: 1
    };
  }

  const user = data.users[userId];



  // 🌳 WHISPER (SPRITES)

  if (message.content === "!whisper") {

    data.server.sprites += 1;
    user.points += 1;

    saveData();

    await updateForestHeart(client);

    message.reply("🧚‍♀️ Sprite magic flickers through the trees...");
  }



  // 🌳 RUSTLE (GREMLINS)

  if (message.content === "!rustle") {

    data.server.gremlins += 1;
    user.points += 1;

    saveData();

    await updateForestHeart(client);

    message.reply("👹 Gremlins rustle through the bushes...");
  }



  // 🌳 HEART (SHOW SCOREBOARD)

  if (message.content === "!heart") {

    message.reply(`💚🌳 **Heart of the Forest** 🌳💚

🧚‍♀️✨ Sprite Magic: ${data.server.sprites}
👹🍂 Gremlin Mischief: ${data.server.gremlins}

🌳 Deep within the forest, a quiet pulse stirs...`);
  }



  // 🌳 NATURE (PERSONAL STATS)

  if (message.content === "!nature") {

    let factionName =
      user.faction === "sprite"
        ? "🧚‍♀️ Spellbound Sprite"
        : user.faction === "gremlin"
        ? "👹 Feral Gremlin"
        : "🌙 Moon Wanderer";

    message.reply(`🌳 **Your True Nature**

Faction: ${factionName}
Points: ${user.points}
Level: ${user.level}`);
  }

});

client.login(process.env.DISCORD_TOKEN);
