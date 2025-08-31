const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
  cmd: ["cookies"],
  slashcommand: new SlashCommandBuilder()
    .setName("cookies")
    .setDescription(`This week's Crumbl cookies`),
  run: async (client, interaction, options, cmd) => {
    try {
      const cookies = await scrapeCookies();

      const embeds = [];

      const initialEmbed = {
        title: "🍪 Weekly Cookie Flavors",
        description: "This week's Crumbl Cookies",
        thumbnail: { url: "https://mir-s3-cdn-cf.behance.net/projects/404/dc4280179811399.Y3JvcCwyMjM1LDE3NDgsOTI0LDI4Mg.jpg" },
        fields: [
          { name: "Website", value: "[Crumbl Cookies](https://crumblcookies.com/)" }
        ]
      };

      embeds.push(initialEmbed);

      for (const cookie of cookies) {
        const embed = {
          title: cookie.name,
          description: cookie.description,
          color: parseInt("8d3e95", 16),
          image: { url: cookie.imageURL },
          timestamp: new Date()
        };

        embeds.push(embed);
      }

      await interaction.reply({ embeds: embeds });

    } catch (error) {
      console.error('Error scraping data:', error);
      await interaction.reply({ content: "An error occurred while processing the command.", ephemeral: true });
    }
  }
};

async function scrapeCookies() {
  //const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser' });
  const page = await browser.newPage();
  await page.goto('https://crumbl.com/');
  await page.waitForSelector('div[id*="Cookie"]');

  const cookies = await page.evaluate(() => {
    const cookieElements = document.querySelectorAll('div[id*="Cookie"]');
    const cookiesData = [];

    cookieElements.forEach(cookieElement => {
      const name = cookieElement.querySelector('p.font-extrabold')?.textContent.trim() || 'No name available';
      const descriptionNode1 = cookieElement.querySelector('p:nth-of-type(2)');
      const descriptionNode2 = cookieElement.querySelector('p:nth-of-type(3)');
      const description = (descriptionNode1 ? descriptionNode1.textContent.trim() : '') + 
                          (descriptionNode2 ? '\n\n' + descriptionNode2.textContent.trim() : '') || 
                          'No description available';
      const imageURL = cookieElement.querySelector('img:nth-of-type(2)')?.src || 'No image available';

      cookiesData.push({ name, description, imageURL });
    });

    return cookiesData;
  });

  await browser.close();

  return cookies;
}
