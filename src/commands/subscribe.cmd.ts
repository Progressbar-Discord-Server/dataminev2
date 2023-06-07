import getLatestCommit from '../methods/getLatestCommit';
import sendCommit from '../methods/sendCommit';
import { Server } from '../models/Server';
import { SlashCommand } from './SlashCommand';

export default new SlashCommand(
  {
    name: 'subscribe',
    description: 'Subscribe to Datamine posts',
    options: [
      {
        type: 7,
        name: 'channel',
        description: 'Set the channel that will receive Datamine posts',
        required: true,
        channel_types: [0, 5],
      },
      {
        type: 8,
        name: 'role',
        description: 'Set the role that will receive pings about Datamine',
      },
    ],
  },
  async ($, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    const channel = interaction.options.getChannel('channel', true);
    const role = interaction.options.getRole('role');
    const exists = await Server.exists({
      _id: interaction.guildId,
    });
    if (exists) {
      await interaction.editReply(
        'This server is already subscribed. Use the config command to update settings.'
      );
    } else {
      const server = await Server.create({
        _id: interaction.guildId,
        channel: channel.id,
        role: role ? role.id : undefined,
      });
      await interaction.editReply(
        'This server is now subscribed. Sending latest commit.'
      );
      const [commit] = await getLatestCommit();
      await sendCommit($, commit, server);
    }
  },
  {
    guildOnly: true,
    modOnly: true,
  }
);
