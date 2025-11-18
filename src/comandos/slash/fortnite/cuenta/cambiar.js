const ExtendedClient = require('../../../../estructuras/esctructura');
const { ChatInputCommandInteraction, SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('cambiar')
        .setDescription('Cambia de cuenta principal en Vendetta'),
    options: {
        fortnite: false,
    },
    /**
     * Ejecuta el comando para cambiar la cuenta.
     * @param {ExtendedClient} client - El cliente extendido de Discord.
     * @param {ChatInputCommandInteraction} interaction - La interacción del comando.
     */
    run: async (client, interaction, loginData, mongodb) => {

        const userId = interaction.user.id;

        /**
         * Buscar el documento existente para el usuario
         */
        const db = await mongodb.findOne({ id: userId });

        if (!db || !db.deviceAuths || db.deviceAuths.length === 0) {
            /**
             * No hay cuentas guardadas, devolver un error
             */
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('`⚠️` No tienes ninguna cuenta registrada en Vendetta, usa `/registrar` para empezar.')
                        .setColor(Colors.Red)
                ]
            });
        }

        /**
         * Crear opciones del menú de selección basadas en las cuentas guardadas
         */
        const selecionMenu = db.deviceAuths.map((account, index) => ({
            label: account.displayName || `Cuenta ${index + 1}`,
            value: account.accountId,
        }));

        /**
         * Crear un menú de selección
         */
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('cambiar_cuenta_selecionada')
            .setPlaceholder('Seleciona una cuenta')
            .addOptions(selecionMenu);

        /**
         * Crear una fila de acción con el menú de selección
         */
        const actionRow = new ActionRowBuilder().addComponents(selectMenu);

        /**
         * Responder con el menú de selección
         */
        const embedCambiar = new EmbedBuilder()
            .setDescription('**Selecciona una cuenta para cambiar:**')
            .setColor(Colors.DarkBlue);

        interaction.reply({
            embeds: [embedCambiar],
            components: [actionRow]
        });
    }
};