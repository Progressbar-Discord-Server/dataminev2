import CommitHandler from '../CommitHandler';
import { Database } from '../Database';
import getLatestCommit from '../methods/getLatestCommit';
import { Event } from './Event';

export default new Event('ready', async botUser => {
  console.log('Connected to Discord.', `Logged in as ${botUser.user?.tag}`);
  Database();
  await CommitHandler(botUser);
  setInterval(CommitHandler, 60000 * 5, botUser);
  const [latest] = await getLatestCommit();
  botUser.user?.setActivity({
    name: `Build ${latest.buildNumber}`,
    type: 'WATCHING',
    url: latest.url,
  });
});
