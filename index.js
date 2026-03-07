const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const dataFile = "data.json";

let data = {
  users: {},
  server: {
    sprites: 0,
    gremlins: 0
  },
  scoreboardMessageId: null,
  scoreboardChannelId: null
};

if (fs.existsSync(dataFile)) {
  data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

async function updateScoreboard() {
  if (!data.scoreboardChannelId || !data.scoreboardMessageId) return;

  try {
    const channel = await client.channels.fetch(data.scoreboardChannelId);
    const message = await channel.messages.fetch(data.scoreboardMessageId);

    await message.edit(`💚🌳 **Heart of the Forest** 🌳💚

🧚 Sprite Magic: ${data.server.sprites}
👹 Gremlin Mischief: ${data.server.gremlins}

🌳 The forest listens... 💚👂✨`);
  } catch (error) {
    console.error("Scoreboard update failed:", error);
  }
}

client.once("ready", () => {
  console.log("🌳 Heart of the Forest awakens...");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  if (!data.users[userId]) {
    data.users[userId] = {
      faction: "
