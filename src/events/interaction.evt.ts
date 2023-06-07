import { GuildMember } from 'discord.js';
import { Event } from './Event';

export default new Event('interactionCreate', async ($, interaction) => {
  if (interaction.isCommand()) {
    const cmd = $.commands.get(interaction.commandId);
    if (cmd) {
      if (cmd.opts?.guildOnly && !interaction.inGuild()) {
        return await interaction.reply({
          ephemeral: true,
          content: 'This is a guild only command',
        });
      }
      if (
        cmd.opts?.modOnly &&
        !(interaction.member as GuildMember).permissions.has(
          'MANAGE_WEBHOOKS',
          true
        )
      ) {
        return await interaction.reply({
          ephemeral: true,
          content: 'This is a mod only command',
        });
      }
      await cmd.func($, interaction);
    }
  }
});
