import {
  ApplicationCommand,
  Client,
  ClientEvents,
  ClientOptions,
} from 'discord.js';
import { readdir } from 'fs/promises';
import { join, resolve } from 'path';
import { SlashCommand } from './commands/SlashCommand';
import { Event } from './events/Event';

export class DatamineBot extends Client {
  commands: Map<ApplicationCommand['id'], SlashCommand> = new Map();
  constructor(opts: ClientOptions) {
    super(opts);
  }

  async loadCommands(): Promise<void> {
    const dir = resolve(__dirname, 'commands');
    const files = await readdir(dir);
    for (const commandFile of files) {
      const { default: command } = (await import(join(dir, commandFile))) as {
        default?: SlashCommand;
      };
      if (this.application && command) {
        const cmds = await this.application.commands.fetch();
        let cmd = cmds.find(c => c.name === command.data.name);
        if (!cmd) {
          cmd = await this.application.commands.create(command.data);
        }
        this.commands.set(cmd.id, command);
        console.log(`Loaded Command: ${cmd.name}`);
      }
    }
  }

  async loadEvents(): Promise<void> {
    const dir = resolve(__dirname, 'events');
    const files = await readdir(dir);
    for (const eventFile of files) {
      const { default: event } = (await import(join(dir, eventFile))) as {
        default?: Event<keyof ClientEvents>;
      };
      if (Event.isEvent(event)) {
        if (event.opts?.once) {
          this.once(event.name, (...args) => {
            event.func(this, ...args);
          });
        } else {
          this.on(event.name, (...args) => {
            event.func(this, ...args);
          });
        }
        console.log(`Loaded Event: ${event.name}`);
      }
    }
  }
}
