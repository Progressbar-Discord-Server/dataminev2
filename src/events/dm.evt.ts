import sendAnnouncement from '../methods/sendAnnouncement';
import { Server } from '../models/Server';
import { Event } from './Event';

export default new Event('messageCreate', async ($, event) => {
  if (event.channel.type === 'DM') {
    if (event.author.id === process.env.OWNERID) {
      const servers = await Server.find();
      await sendAnnouncement($, event, servers);
    }
  }
});
