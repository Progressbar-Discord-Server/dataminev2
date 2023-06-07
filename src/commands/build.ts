import sendCommitEphemeral from '../methods/sendCommitEphemeral';
import { Commit } from '../models/Commit';
import { SlashCommand } from './SlashCommand';

export default new SlashCommand(
  {
    name: 'build',
    description: "Get a specific build number's Datamine comment(s)",
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
    if (commit) {
      await sendCommitEphemeral($, commit, interaction);
    } else {
      await interaction.editReply(
        `No Commit(s) Found for Build ${buildNumber}`
      );
    }
  }
);
