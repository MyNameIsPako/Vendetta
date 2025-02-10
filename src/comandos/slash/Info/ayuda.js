const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Colors } = require('discord.js');
const ExtendedClient = require('../../../estructuras/esctructura');
const config = require('../../../configuraciones/vendetta.js');
const servidores = require('../../../schemas/servidores');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('ayuda')
        .setDescription('Revisa el menu de ayuda de Vendetta.'),
    options: {
        cooldown: 15000
    },
    /**
     * Ejecuta el comando de ayuda.
     * @param {ExtendedClient} client - El cliente extendido de Discord.
     * @param {ChatInputCommandInteraction} interaction - La interacción del comando.
     */
    run: async (client, interaction, loginData, mongodb) => {

        await interaction.deferReply();

        let prefix = config.handler.prefix;

        if (config.handler?.mongodb?.activado) {
            try {
                const data = await servidores.findOne({ guild: interaction.guildId });

                if (data && data?.prefix) prefix = data.prefix;
            } catch {
                prefix = config.handler.prefix;
            }
        }

        const mapearSlash = client.applicationComandosArray.map((v) => `\`${(v.type === 2 || v.type === 3) ? '' : '/'}${v.name}\`: *${v.description || 'Sin descripción...'}*`);
        const mapearPrefix = client.collection.prefixComandos.map((v) => `\`${prefix}${v.structure.name}\` ${v.structure.alias.length > 0 ? `(${v.structure.alias.map((a) => `**${a}**`).join(', ')})` : ':'} *${v.structure.description || 'Sin descripción...'}*`);

        const comandosSlash = mapearSlash.join('\n') || 'No hay comandos comandosSlash...';
        const comandosPrefix = mapearPrefix.join('\n') || 'No hay comandos de prefijo...';

        const fields = [];

        if (comandosSlash) {
            fields.push({ name: '`🔎` comandosSlash:', value: `>>> ${comandosSlash}` });
        } else {
            fields.push({ name: '`🔎` comandosSlash:', value: '>>> No hay comandos comandosSlash...' });
        }

        if (comandosPrefix) {
            fields.push({ name: '`✉️` Prefix:', value: `>>> ${comandosPrefix}` });
        } else {
            fields.push({ name: '`✉️` Prefix:', value: '>>> No hay comandos de prefijo...' });
        }

        /**
         * Crear botones de enlace
         */
        const boton1 = new ButtonBuilder()
            .setLabel('Servidor de soporte')
            .setEmoji('🆘')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/miabot');

        const boton2 = new ButtonBuilder()
            .setLabel('Invitación')
            .setEmoji('🔗')
            .setStyle(ButtonStyle.Link)
            .setDisabled(true) // Esto ponlo en false cuando añades la invitacion de tu bot
            .setURL("https://discord.dev");

        const boton3 = new ButtonBuilder()
            .setLabel('GitHub')
            .setEmoji('📂')
            .setStyle(ButtonStyle.Link)
            .setURL('https://github.com/MyNameIsPako/Vendetta');

        /**
         * Crear una fila de acción con los botones
         */
        const actionRow = new ActionRowBuilder().addComponents(boton1, boton2, boton3);

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Menu de ayuda de Vendetta')
                    .setDescription(`Vendetta es un bot enfocado en Fortnite y su API, creado por **@mynameispako** para enseñar a los usuarios cómo utilizar la API de Fortnite de manera efectiva.\n\n> \`🌿\` Puedes usar y modificar el bot a tu gusto, siempre y cuando des crédito al creador original en alguna parte, por ejemplo, indicando "Base del bot por @mynameispako".`)
                    .addFields(fields)
                    .setColor(Colors.DarkBlue)
                    .setFooter({
                        text: 'Syntax: [opcional] - <obligatorio>',
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    })
            ],
            components: [actionRow]
        });

    }
};