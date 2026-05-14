const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PIXIE_WEBHOOK_URL = process.env.PIXIE_WEBHOOK_URL;

const dataFile = "data.json";

let data = {
  users: {},
  server: {
    sprites: 0,
    gremlins: 0,
  },
  scoreboardMessageId: null,
  scoreboardChannelId: null,
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
    await message.edit(
      `🌿 🍄 **Heart of the Forest** 🍄 🌿\n` +
      `✨ Sprite Magic: ${data.server.sprites}\n` +
      `👺 Gremlin Mischief: ${data.server.gremlins}\n\n` +
      `🌲 The forest listens... 🌿 🩷 🌸`
    );
  } catch (error) {
    console.error("Scoreboard update failed:", error);
  }
}

client.once("clientReady", () => {
  console.log("🌲 Heart of the Forest awakens...");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
  if (
    message.content.startsWith("!pixie ") &&
    isAdmin &&
    message.channel.id === "1479228710417596519"
  ) {
    const pixieMessage = message.content.slice(7);

    const openings = [
      {
        text: "🌸 ✨ *the pixies flutter... a message arrives from the distant realm...* 🍄 ✨",
        img: "https://cdn.discordapp.com/emojis/1503537796747493507.gif",
      },
      {
        text: "🩷 🌿 *the Goddess stirs in her distant realm. the pixies carry her words...* 🍄 🩷",
        img: "https://cdn.discordapp.com/emojis/1503543253348122714.gif",
      },
      {
        text: "🌿 ✨ *something moves through the canopy. the pixies are restless tonight...* 🍄 🩷",
        img: "https://cdn.discordapp.com/emojis/1503545725638807704.gif",
      },
      {
        text: "🌸 🍂 *the pixies have been busy. they bring word from the Goddess...* ✨ 🌿",
        img: "https://cdn.discordapp.com/emojis/1503548542747414558.gif",
      },
      {
        text: "🩷 🌿 *the Goddess tends to distant realms. but she has not forgotten this forest...* 🌿 🩷",
        img: "https://cdn.discordapp.com/emojis/1503550534970507425.gif",
      },
      {
        text: "🌸 ✨ *even from afar, the Goddess watches. tonight she speaks through the pixies...* 🍄 ✨",
        img: "https://cdn.discordapp.com/emojis/1503551334870155294.gif",
      },
    ];

    const random = openings[Math.floor(Math.random() * openings.length)];

    const embed = new EmbedBuilder()
      .setColor(0xc084fc)
      .setDescription(`${random.text}\n\n🌿 **${pixieMessage}** 🌿`)
      .setThumbnail(random.img)
      .setFooter({ text: "✨ a message from the Goddess 🍄" });

    await fetch(PIXIE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed.toJSON()] }),
    });

    await message.reply("🌸 ✨ The pixies have spoken. ✨ 🍄");
    await message.delete();
    return;
  }

  if (message.content === "!setscoreboard" && isAdmin) {
    const sent = await message.channel.send(
      `🌿 🍄 **Heart of the Forest** 🍄 🌿\n` +
      `✨ Sprite Magic: ${data.server.sprites}\n` +
      `👺 Gremlin Mischief: ${data.server.gremlins}\n\n` +
      `🌲 The forest listens... 🌿 🩷 🌸`
    );
    data.scoreboardMessageId = sent.id;
    data.scoreboardChannelId = message.channel.id;
    saveData();
    await message.reply("✅ Scoreboard set!");
    return;
  }
  const userId = message.author.id;
  const now = Date.now();

  if (!data.users[userId]) {
    data.users[userId] = {
      faction: "",
      xp: 0,
      spriteSignals: 0,
      gremlinSignals: 0,
      lastMessageTime: null,
      sessionStart: null,
      messageCount: 0,
      lastBurstTime: null,
    };
  }

  const user = data.users[userId];

  if (user.sessionStart && now - user.sessionStart > 30 * 60 * 1000) {
    user.spriteSignals = 0;
    user.gremlinSignals = 0;
    user.messageCount = 0;
    user.lastBurstTime = null;
    user.sessionStart = null;
  }

  if (!user.sessionStart) user.sessionStart = now;

  if (message.reference) user.spriteSignals += 1;

  if (user.lastMessageTime && now - user.lastMessageTime > 2 * 60 * 1000) {
    user.spriteSignals += 1;
  }

  if (message.attachments.size > 0) user.gremlinSignals += 1;

  user.messageCount += 1;

  if (user.lastMessageTime && now - user.lastMessageTime < 10000) {
    user.gremlinSignals += 1;
  }

  user.lastMessageTime = now;

  if (!user.faction && (user.spriteSignals + user.gremlinSignals) >= 10) {
    if (user.spriteSignals > user.gremlinSignals) {
      user.faction = "sprite";
      data.server.sprites += 1;
      await message.channel.send(
        `✨ <@${userId}> the forest has seen your light. you walk the **Sprite** path.`
      );
    } else {
      user.faction = "gremlin";
      data.server.gremlins += 1;
      await message.channel.send(
        `👺 <@${userId}> the roots have claimed you. you walk the **Gremlin** path.`
      );
    }
    await updateScoreboard();
  }

  user.xp = (user.xp || 0) + 1;
  saveData();
});

client.login(process.env.DISCORD_TOKEN);
