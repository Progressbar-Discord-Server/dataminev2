import { MessageEmbed } from 'discord.js';
import getLatestCommit from '../methods/getLatestCommit';
import sendCommit from '../methods/sendCommit';
import { Server } from '../models/Server';
import { SlashCommand } from './SlashCommand';

export default new SlashCommand(
  {
    name: 'config',
    description: "Modify DatamineBot's Config for the Current Server",
    options: [
      {
        type: 1,
        name: 'channel',
        description: 'Set the channel that will receive Datamine posts',
        options: [
          {
            type: 7,
            name: 'channel',
            description: 'Set the channel that will receive Datamine posts',
            required: true,
            channel_types: [0, 5],
          },
        ],
      },
      {
        type: 1,
        name: 'role',
        description: 'Set the role that will receive pings about Datamine',
        options: [
          {
            type: 8,
            name: 'role',
            description: 'Set the role that will receive pings about Datamine',
          },
        ],
      },
      {
        type: 1,
        name: 'remove',
        description: 'Removes this server from DatamineBot',
        options: [],
      },
      {
        type: 1,
        name: 'get',
        description: "Displays DatamineBot's Config for the Current Server",
        options: [],
      },
    ],
  },
  async ($, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    const sub = interaction.options.getSubcommand(true);
    if (sub === 'get') {
      try {
        const server = await Server.findById(interaction.guildId);
        if (server) {
          const embed = new MessageEmbed().addFields([
            {
              name: 'Channel',
              value: `<#${server.channel}>`,
            },
            {
              name: 'Role',
              value: server.role ? `<@&${server.role}>` : 'No Role Set',
            },
          ]);
          interaction.editReply({
            embeds: [embed],
          });
        } else {
          interaction.editReply('No config found');
        }
      } catch (error) {
        interaction.editReply(`${error}`);
      }
    }
    if (sub === 'remove') {
      try {
        await Server.deleteOne({ _id: interaction.guildId });
        interaction.editReply("Deleted the current guild's config");
      } catch (error) {
        interaction.editReply(`${error}`);
      }
    }
    if (sub === 'role') {
      const role = interaction.options.getRole('role');
      try {
        const server = await Server.findOneAndUpdate(
          { _id: interaction.guildId },
          { role: role?.id ?? '' },
          { upsert: true, new: true }
        );
        interaction.editReply(
          server.role
            ? `<@&${server.role}> has been set to receive notifications of Datamine posts.`
            : 'Role has been unset'
        );
      } catch (error) {
        interaction.editReply(`${error}`);
      }
    }
    if (sub === 'channel') {
      const chan = interaction.options.getChannel('channel', true);
      if (chan.type !== 'GUILD_TEXT') {
        interaction.editReply('Channel must be a Text Channel');
      } else {
        try {
          const server = await Server.findOneAndUpdate(
            { _id: interaction.guildId },
            { channel: chan.id },
            { upsert: true, new: true }
          );
          interaction.editReply(
            `<#${server?.channel}> has been set to receive Datamine posts. Sending most recent one now!`
          );
          const commit = await getLatestCommit();
          if (commit) {
            await sendCommit($, commit[0], server!, true);
          }
        } catch (error) {
          interaction.editReply(`${error}`);
        }
      }
    }
  },
  {
    guildOnly: true,
    modOnly: true,
  }
);
