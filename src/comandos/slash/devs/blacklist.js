const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Colors
} = require("discord.js");
const ExtendedClient = require("../../../estructuras/esctructura");
const Usuario = require("../../../schemas/usuarios");

module.exports = {
    structure: new SlashCommandBuilder()
        .setName("balcklist")
        .setDescription("Añade o elimina a un usuario de la blacklist de Vendetta. (devs)")
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Dime que deseas hacer')
                .setRequired(true)
                .addChoices(
                    { name: 'Añadir a Blacklist', value: 'add_blacklist' },
                    { name: 'Quitar de Blacklist', value: 'remove_blacklist' }
                )
        )
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a añadir o quitar de la blacklist')
                .setRequired(true)
        ),
    options: {
        developers: true,
    },
    /**
     * Ejecuta el comando de blacklist.
     * @param {ExtendedClient} client - El cliente extendido de Discord.
     * @param {ChatInputCommandInteraction<true>} interaction - La interacción del comando.
     */
    run: async (client, interaction, loginData, mongodb) => {
        const tipo = interaction.options.getString('tipo');
        const usuario = interaction.options.getUser('usuario');
        const embed = new EmbedBuilder()
            .setColor(Colors.Green);

        switch (tipo) {
            case 'add_blacklist':
                await Usuario.findOneAndUpdate({ id: usuario.id }, { blacklisted: true }, { upsert: true });
                interaction.reply({ embeds: [embed.setDescription(`\`✅\` Usuario ${usuario.tag} añadido a la blacklist con éxito`)], ephemeral: true });
                break;
            case 'remove_blacklist':
                await Usuario.findOneAndUpdate({ id: usuario.id }, { blacklisted: false }, { upsert: true });
                interaction.reply({ embeds: [embed.setDescription(`\`✅\` Usuario ${usuario.tag} quitado de la blacklist con éxito`)], ephemeral: true });
                break;
        }
    }
};