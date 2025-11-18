const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Colors
} = require("discord.js");
const ExtendedClient = require("../../../estructuras/esctructura");
const cargarComandos = require("../../../handlers/funciones/comandos");
const cargarEventos = require("../../../handlers/funciones/eventos");

module.exports = {
    structure: new SlashCommandBuilder()
        .setName("recargar")
        .setDescription("Recarga los comandos o eventos del bot. (devs)")
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Elige qué deseas recargar')
                .setRequired(true)
                .addChoices(
                    { name: 'Comandos', value: 'comandos' },
                    { name: 'Eventos', value: 'eventos' }
                )
        ),
    options: {
        developers: true,
    },
    /**
     * Ejecuta el comando de recarga.
     * @param {ExtendedClient} client - El cliente extendido de Discord.
     * @param {ChatInputCommandInteraction<true>} interaction - La interacción del comando.
     */
    run: async (client, interaction, loginData, mongodb) => {
        const tipo = interaction.options.getString('tipo');
        const embed = new EmbedBuilder()
            .setColor(Colors.Green);

        switch (tipo) {
            case 'comandos':
                cargarComandos(client);
                interaction.reply({ embeds: [embed.setDescription('`✅` Comandos recargados con éxito')], ephemeral: true });
                break;
            case 'eventos':
                cargarEventos(client);
                interaction.reply({ embeds: [embed.setDescription('`✅` Eventos recargados con éxito')], ephemeral: true });
                break;
        }
    }
};