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
  if (message.content.startsWith("!pixie ") && 
    message.member.permissions.has("Administrator") &&
    message.channel.name === "spell-lab") {
  
  const pixieMessage = message.content.slice(7);
  const pixieChannel = message.guild.channels.cache.find(
    ch => ch.name === "pixie-post"
  );

  const openings = [
    "🌿 *the pixies flutter... a message arrives from the distant realm...*",
    "✨ *the Goddess stirs in her distant realm. the pixies carry her words...*",
    "🌙 *something moves through the canopy. the pixies are restless tonight. a message is coming...*",
    "🌿 *the pixies have been busy. they bring word from the Goddess...*",
    "🌙 *the Goddess tends to distant realms. but she has not forgotten this forest. her message arrives now...*",
    "🍄 *even from afar, the Goddess watches. tonight she speaks through the pixies...*"
  ];

  const randomOpening = openings[Math.floor(Math.random() * openings.length)];
  
  if (pixieChannel) {
    await pixieChannel.send(`${randomOpening}\n\n${pixieMessage}`);
    await message.reply("✨ The pixies have spoken.");
    await message.delete();
  }
  return;
}

  const userId = message.author.id;

  if (!data.users[userId]) {
    data.users[userId] = {
      faction: "
         
