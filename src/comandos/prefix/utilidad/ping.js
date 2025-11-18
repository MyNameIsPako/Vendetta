const { Message, EmbedBuilder, Colors } = require('discord.js');
const ExtendedClient = require('../../../estructuras/esctructura');

module.exports = {
    structure: {
        name: 'ping',
        description: 'Revisa el ping de Vendetta.',
        alias: [],
        cooldown: 5000
    },
    /**
     * Ejecuta el comando ping.
     * @param {ExtendedClient} client - El cliente extendido de Discord.
     * @param {Message<true>} message - El mensaje del comando.
     * @param {string[]} args - Los argumentos del comando.
     */
    run: async (client, message, args) => {
        const ping = client.ws.ping;

        const embed = new EmbedBuilder()
            .setTitle('Pong!')
            .setDescription(`\`🏓\` Ping del bot: \`${ping}ms\``)
            .setColor(Colors.Green);

        await message.reply({ embeds: [embed] });
    }
};