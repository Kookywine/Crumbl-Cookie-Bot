const { Client, Collection, GatewayIntentBits } = require("discord.js");
const config = require("./config.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const cookiesCommand = require("./commands/cookies.js");
cookiesCommand.cmd.forEach(name => client.commands.set(name, cookiesCommand));

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.run(client, interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "There was an error executing that command.", ephemeral: true });
  }
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(config.token);
