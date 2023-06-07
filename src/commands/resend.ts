import resendCommit from '../methods/resendCommit';
import { Commit } from '../models/Commit';
import { Server } from '../models/Server';
import { SlashCommand } from './SlashCommand';

export default new SlashCommand(
  {
    name: 'resend',
    description: 'Resend comments for a build number',
    options: [
      {
        type: 4,
        name: 'buildnumber',
        description: 'The build number',
        required: true,
      },
    ],
  },
  async ($, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    const buildNumber = interaction.options.getInteger('buildnumber', true);
    const commit = await Commit.findOne({ buildNumber: `${buildNumber}` });
    const server = await Server.findById(interaction.guildId);
    if (server) {
      if (commit) {
        await resendCommit($, commit, server, interaction);
      } else {
        await interaction.editReply(
          `No Commit(s) Found for Build ${buildNumber}`
        );
      }
    } else {
      await interaction.editReply('This server is not configured');
    }
  },
  {
    guildOnly: true,
    modOnly: true,
  }
);
