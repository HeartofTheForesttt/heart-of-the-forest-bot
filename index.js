const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`🌲 Heart of the Forest awakens...`);
  client.user.setActivity("watching the forest grow 🌱");
});

client.on('messageCreate', message => {
  if (message.content === '!sprite') {
    message.reply('🧚‍♀️ Sprite magic flickers through the trees...');
  }
});

client.login(process.env.DISCORD_TOKEN);
