import type { User as PrismaUser } from '@prisma/client';
import { Events, Listener, Result } from '@sapphire/framework';
import { type RateLimit, RateLimitManager } from '@sapphire/ratelimits';
import { Time } from '@sapphire/time-utilities';
import { roundNumber } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { getUser } from '#lib/database';
import { isGuildMessage } from '#lib/utilities/discord-utilities';
import { handleExperience } from '#lib/utilities/experience';

export class MessageExperience extends Listener<typeof Events.MessageCreate> {
	public constructor(context: Listener.LoaderContext, options: Listener.Options = {}) {
		super(context, {
			...options,
			event: Events.MessageCreate,
		});
	}

	public async run(message: Message) {
		if (message.author.bot || !isGuildMessage(message) || message.system) return;

		const ratelimit = this.getManager(message.author.id).acquire(message.author.id);

		if (ratelimit.limited) return;

		const result = await Result.fromAsync(async () => getUser(message.author.id));

		await result.match({
			ok: async data => this.handleOk(message, data, ratelimit),
			err: error => this.container.logger.error(error),
		});
	}

	private async handleOk(message: Message, data: PrismaUser, ratelimit: RateLimit<string>) {
		const experience = roundNumber(Math.random() * 11 + 15);

		const result = await handleExperience(experience, data);

		await result.match({
			ok: async data => {
				ratelimit.consume();
				if (data === false) return;
				await message.channel.send(
					`Congratulations ${message.author}, you have leveled up to level ${data.level}!`,
				);
			},
			err: async error => this.container.logger.error(error),
		});
	}

	private getManager(id: string) {
		const manager = this.container.experienceBucket.get(id);
		if (manager) return manager;

		const newManager = new RateLimitManager(Time.Minute);
		this.container.experienceBucket.set(id, newManager);
		return newManager;
	}
}
