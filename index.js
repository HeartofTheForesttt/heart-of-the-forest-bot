const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

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
      `🌿🍀 **Heart of the Forest** 🍀🌿\n` +
      `🌟 Sprite Magic: ${data.server.sprites}\n` +
      `👺 Gremlin Mischief: ${data.server.gremlins}\n\n` +
      `🌲 The forest listens... 🌿💚✨`
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
    const pixieChannel = message.guild.channels.cache.get("1478863772998434839");

    const openings = [
      { text: "✨🌸 *the pixies flutter... a message arrives from the distant realm...* 🌸✨", img: "https://cdn.discordapp.com/attachments/1479228710417596519/1499278383287369769/IMG_6998.png?ex=69f4374d&is=69f2e5cd&hm=eaefa996bac0d2eb152a6203ee6953ef7879ee392cc5c024104a8a38b2f23e54&" },
      { text: "💜🌺 *the Goddess stirs in her distant realm. the pixies carry her words...* 🌺💜", img: "https://cdn.discordapp.com/attachments/1479228710417596519/1499278378048422041/IMG_6998.png?ex=69f4374c&is=69f2e5cc&hm=d7abea988ec4d52a845bb9f94143b572354d0060f7f32ad01d35a611d779fb55&" },
      { text: "🍃✨ *something moves through the canopy. the pixies are restless tonight...* ✨🍃", img: "https://cdn.discordapp.com/attachments/1479228710417596519/1499278371438198935/IMG_6998.png?ex=69f4374a&is=69f2e5ca&hm=79f054ab4dc53aa6bab2d1a878a0881ce482a456d9fc4bf128fc5e3d75ac4758&" },
      { text: "🌸💫 *the pixies have been busy. they bring word from the Goddess...* 💫🌸", img: "https://cdn.discordapp.com/attachments/1479228710417596519/1499278366317088769/IMG_6998.png?ex=69f43749&is=69f2e5c9&hm=c0f0fac403db3663a61807d6f5852380c360d80e610255d3c6b929c610135163&" },
      { text: "💜🍃 *the Goddess tends to distant realms. but she has not forgotten this forest...* 🍃💜", img: "https://cdn.discordapp.com/attachments/1479228710417596519/1499278047663362128/IMG_6998.png?ex=69f436fd&is=69f2e57d&hm=518031f4eeb6cbd86383983e712b6531942c3a15b05757ef659816bb1ebf22b1&" },
      { text: "✨🌺 *even from afar, the Goddess watches. tonight she speaks through the pixies...* 🌺✨", img: "https://cdn.discordapp.com/attachments/1479228710417596519/1499277875575263233/IMG_6998.png?ex=69f436d4&is=69f2e554&hm=d005d3f24a050655f72f96ed4ab6e9fe83a27be2d66b3d38449e0c51657999f7&" },
    ];

    const random = openings[Math.floor(Math.random() * openings.length)];

    if (pixieChannel) {
      const embed = new EmbedBuilder()
        .setColor(0xc084fc)
        .setDescription(`${random.text}\n\n🌿 *${pixieMessage}* 🌿`)
        .setThumbnail(random.img)
        .setFooter({ text: "✨ a message from the Goddess ✨" });
      await pixieChannel.send({ embeds: [embed] });
      await message.reply("🌸✨ The pixies have spoken. ✨🌸");
      await message.delete();
    } else {
      await message.reply("❌ Could not find the pixie-post channel.");
    }
    return;
  }

  if (message.content === "!setscoreboard" && isAdmin) {
    const sent = await message.channel.send(
      `🌿🍀 **Heart of the Forest** 🍀🌿\n` +
      `🌟 Sprite Magic: ${data.server.sprites}\n` +
      `👺 Gremlin Mischief: ${data.server.gremlins}\n\n` +
      `🌲 The forest listens... 🌿💚✨`
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
        `🌟 <@${userId}> the forest has seen your light. you walk the **Sprite** path.`
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
