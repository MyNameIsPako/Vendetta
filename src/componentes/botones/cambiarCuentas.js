const { StringSelectMenuInteraction, ActionRowBuilder, ButtonBuilder, Colors } = require('discord.js');
const mongodb = require('../../schemas/usuarioInfo');
const { EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const ExtendedClient = require('../../estructuras/esctructura');
const axios = require("axios");

module.exports = {
    customId: 'cambiar_cuenta',
    /**
     * Ejecuta el cambio de cuenta.
     * @param {ExtendedClient} client - El cliente extendido de Discord.
     * @param {StringSelectMenuInteraction} interaction - La interacción del menú de selección.
     */
    run: async (client, interaction) => {
        const idUsuario = interaction.user.id;

        /**
         * Buscar el documento existente para el usuario
         */
        const usuarioDB = await mongodb.findOne({ id: idUsuario });

        if (!usuarioDB || !usuarioDB.deviceAuths || usuarioDB.deviceAuths.length === 0) {
            /**
             * No hay cuentas guardadas, devolver un error
             */
            const embedNo = new EmbedBuilder()
                .setDescription(`\`❌\` No tienes ninguna cuenta registrada.`)
                .setColor(Colors.Red);
            return interaction.reply({
                embeds: [embedNo],
                ephemeral: true,
            });
        }

        /**
         * Crear opciones del menú de selección basadas en las cuentas guardada
         */
        const opcionesMenu = usuarioDB.deviceAuths.map((account, index) => ({
            label: account.displayName || `Cuenta ${index + 1}`,
            value: account.accountId,
        }));

        /**
         * Crear un menú de selección
         */
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('cambiar_cuenta_selecionada')
            .setPlaceholder('Seleciona una cuenta')
            .addOptions(opcionesMenu);

        /**
         * Crear una fila de acción con el menú de selección
         */
        const actionRow = new ActionRowBuilder().addComponents(selectMenu);

        /**
         * Responder con el menú de selección
         */
        const embedCambio = new EmbedBuilder()
            .setDescription('**Selecciona una cuenta para cambiar:**')
            .setColor(Colors.Blue);
        interaction.reply({
            embeds: [embedCambio],
            components: [actionRow],
            ephemeral: true
        });
    },
};