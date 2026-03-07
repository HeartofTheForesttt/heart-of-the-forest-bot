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


// 🌳 CREATE DATA FILE IF IT DOESN'T EXIST
if (!fs.existsSync("./data.json")) {
  const starterData = {
    server: {
      sprites: 0,
      gremlins: 0
    },
    users: {}
  };

  fs.writeFileSync("./data.json", JSON.stringify(starterData, null, 2));
}


// 🌳 LOAD DATA
let data = JSON.parse(fs.readFileSync("./data.json", "utf8"));

function saveData() {
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}


// 🌳 UPDATE SCOREBOARD
async function updateForestHeart() {

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


// 🌳 BOT START
client.once("ready", async () => {

  console.log("🌳 Heart of the Forest awakens...");

  await updateForestHeart();

});


// 🌳 COMMAND HANDLER
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


  // 🧚 WHISPER
  if (message.content === "!whisper") {

    data.server.sprites += 1;
    saveData();

    await updateForestHeart();

    return message.reply("🧚‍♀️ A sprite whisper echoes through the canopy...");
  }


  // 👹 RUSTLE
  if (message.content === "!rustle") {

    data.server.gremlins += 1;
    saveData();

    await updateForestHeart();

    return message.reply("👹 Gremlins rustle through the undergrowth...");
  }


  // 🌳 HEART
  if (message.content === "!heart") {

    const channel = await client.channels.fetch(SCOREBOARD_CHANNEL);

    scoreboardMessage = await channel.send(`💚🌳 **Heart of the Forest** 🌳💚

🧚‍♀️✨ Sprite Magic: ${data.server.sprites}

👹🍂 Gremlin Mischief: ${data.server.gremlins}

🌳 The forest listens... 💚👂✨`);

    return;
  }


  // 🌿 NATURE
  if (message.content === "!nature") {

    let factionName =
      user.faction === "sprite"
        ? "🧚‍♀️ Spellbound Sprite"
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
