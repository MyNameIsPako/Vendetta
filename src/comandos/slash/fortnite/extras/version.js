const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const ExtendedClient = require('../../../../estructuras/esctructura');
const axios = require('axios');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('version')
        .setDescription('Muestra la versión actual de Fortnite.'),
    options: {
        fortnite: true,
    },
    /**
     
     * @param {ExtendedClient} client - El cliente extendido de Discord.
     * @param {ChatInputCommandInteraction} interaction - La interacción del comando.
     */
    run: async (client, interaction) => {
        try {
            const response = await axios.get('https://o1-api.onrender.com/api/v1/useragent');
            const userAgent = response.data.useragent;
            
          
            const versionMatch = userAgent.match(/Release-(\d+\.\d+)/);
            const version = versionMatch ? versionMatch[1] : 'Desconocida';
            
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Versión de Fortnite')
                        .setDescription(`La versión actual de Fortnite es: **${version}**`)
                        .setColor(Colors.Blue)
                ]
            });
        } catch (error) {
            console.error('Error al obtener la versión de Fortnite:', error);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('`❌` No se pudo obtener la versión de Fortnite en este momento.')
                        .setColor(Colors.Red)
                ],
                ephemeral: true
            });
        }
    }
};
