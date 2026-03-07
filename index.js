const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
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
  data = JSON.parse(fs.readFileSync(dataFile));
}

function saveData() {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

async function updateScoreboard() {
  if (!data.scoreboardChannelId || !data.scoreboardMessageId) return;

  const channel = await client.channels.fetch(data.scoreboardChannelId);
  const message = await channel.messages.fetch(data.scoreboardMessageId);

  await message.edit(
`💚🌳 **Heart of the Forest** 🌳💚

🧚 Sprite Magic: ${data.server.sprites}
👹 Gremlin Mischief: ${data.server.gremlins}

🌳 The forest listens... 💚👂✨`
  );
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

  if (message.content === ".nature") {

    const user = data.users[userId];

    message.reply(
`🌳 **Your True Nature**

Faction: 🌙 Moon Wanderer
Points: ${user.points}
Level: ${user.level}`
    );

  }

  if (message.content === ".whisper") {

    data.server.sprites += 1;
    saveData();

    message.channel.send("🧚 A sprite whisper echoes through the canopy...");

    updateScoreboard();

  }

  if (message.content === ".rustle") {

    data.server.gremlins += 1;
    saveData();

    message.channel.send("👹 Gremlins rustle through the undergrowth...");

    updateScoreboard();

  }

  if (message.content === ".heart") {

    const scoreboard = await message.channel.send(
`💚🌳 **Heart of the Forest** 🌳💚

🧚 Sprite Magic: ${data.server.sprites}
👹 Gremlin Mischief: ${data.server.gremlins}

🌳 The forest listens... 💚👂✨`
    );

    data.scoreboardMessageId = scoreboard.id;
    data.scoreboardChannelId = message.channel.id;

    saveData();
  }

});

client.login(process.env.DISCORD_TOKEN);
