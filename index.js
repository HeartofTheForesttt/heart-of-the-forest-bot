const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

function saveData() {
  fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

client.once('ready', () => {
  console.log('🌲 Heart of the Forest awakens...');
  client.user.setActivity("watching the forest grow 🌱");
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const userId = message.author.id;

  if (!data.users[userId]) {
    data.users[userId] = {
      faction: null,
      points: 0,
      level: 1
    };
  }

  const user = data.users[userId];

  // SPRITE COMMAND
  if (message.content === '!sprite') {

    if (user.faction === null) {
      user.faction = 'sprite';
      user.points += 1;
      data.server.sprites += 1;

      saveData();

      return message.reply('🌲 Moon Wanderer fades away...\n🧚 A **Spellbound Sprite** awakens.');
    }

    if (user.faction !== 'sprite') {
      return message.reply('👹 You are a **Feral Gremlin**. You cannot channel sprite magic.');
    }

    user.points += 1;
    data.server.sprites += 1;

    saveData();

    return message.reply('🧚 Sprite magic flickers through the trees...');
  }

  // GREMLIN COMMAND
  if (message.content === '!gremlin') {

    if (user.faction === null) {
      user.faction = 'gremlin';
      user.points += 1;
      data.server.gremlins += 1;

      saveData();

      return message.reply('🌲 Moon Wanderer fades away...\n👹 A **Feral Gremlin** emerges.');
    }

    if (user.faction !== 'gremlin') {
      return message.reply('🧚 You are a **Spellbound Sprite**. Gremlin mischief is not yours.');
    }

    user.points += 1;
    data.server.gremlins += 1;

    saveData();

    return message.reply('👹 Gremlin mischief spreads beneath the roots...');
  }

  // FOREST SCOREBOARD
  if (message.content === '!forest') {

    return message.reply(
`🌲 **Heart of the Forest**

🧚 Spellbound Sprites: ${data.server.sprites}
👹 Feral Gremlins: ${data.server.gremlins}`
    );
  }

});

client.login(process.env.DISCORD_TOKEN);
