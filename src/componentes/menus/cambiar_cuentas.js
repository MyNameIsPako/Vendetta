const { StringSelectMenuInteraction, Colors } = require('discord.js');
const db = require('../../schemas/usuarioInfo');
const { EmbedBuilder } = require('discord.js');
const ExtendedClient = require('../../estructuras/esctructura');

module.exports = {
    customId: 'cambiar_cuenta_selecionada',
    /**
     * Ejecuta el cambio de cuenta seleccionada.
     * @param {ExtendedClient} client - El cliente extendido de Discord.
     * @param {StringSelectMenuInteraction} interaction - La interacción del menú de selección.
     */
    run: async (client, interaction) => {
        const userId = interaction?.user?.id || interaction?.member?.id;
        const cuentaMainId = interaction.values[0];

        /**
         * Buscar el documento existente para el usuario
         */
        const dbUsuario = await db.findOne({ id: userId });

        /**
         * Establecer cuentaMain a false para todas las cuentas existentes
         */
        if (dbUsuario && dbUsuario.deviceAuths) {
            dbUsuario.deviceAuths.forEach((account) => {
                account.cuentaMain = false;
            });

            /**
             * Guardar el documento existente actualizado
             */
            await dbUsuario.save();
        }

        /**
         * Actualizar la cuenta seleccionada y recuperar el documento actualizado
         */
        const documentoActualizado = await db.findOneAndUpdate(
            { id: userId, 'deviceAuths.accountId': cuentaMainId },
            { $set: { 'deviceAuths.$.cuentaMain': true } },
            { new: true }
        );

        if (documentoActualizado) {
            /**
             * Encontrar la cuenta seleccionada en el documento actualizado
             */
            const cuentaMain = documentoActualizado.deviceAuths.find(account => account.accountId === cuentaMainId);

            if (cuentaMain) {
                const embedCambio = new EmbedBuilder()
                    .setDescription(`\`🔄️\` Cuenta cambiada a \`${cuentaMain.displayName}\``)
                    .setColor(Colors.Green)
                interaction.reply({
                    embeds: [embedCambio],
                    ephemeral: true
                });
            } else {
                const embedError = new EmbedBuilder()
                    .setDescription('`⚠️` Ocurrio un error al cambiar la cuenta.')
                    .setColor(Colors.Red)
                interaction.reply({
                    embeds: [embedError],
                    ephemeral: true
                });
            }
        } else {
            const embedError = new EmbedBuilder()
                .setDescription('`⚠️` Ocurrio un error al cambiar la cuenta.')
                .setColor(Colors.Red)
            interaction.reply({
                embeds: [embedError],
                ephemeral: true
            });
        }
    }
};