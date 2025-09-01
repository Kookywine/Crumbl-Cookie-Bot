const { Client, Collection, GatewayIntentBits, InteractionResponseFlags } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// Register your command(s)
const cookiesCommand = require('./commands/cookies.js');
cookiesCommand.cmd.forEach(name => client.commands.set(name, cookiesCommand));

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await interaction.deferReply();
    await command.run(client, interaction);
  } catch (error) {
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: 'There was an error executing that command.' });
      } else {
        await interaction.reply({
          content: 'There was an error executing that command.',
          flags: InteractionResponseFlags.Ephemeral
        });
      }
    } catch {}
  }
});

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(config.token);
