import type { User as PrismaUser } from '@prisma/client';
import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import { Listener, Result } from '@sapphire/framework';
import { DurationFormatter, Time } from '@sapphire/time-utilities';
import { isNullish } from '@sapphire/utilities';
import { type VoiceState, type GuildMember, bold, type Guild } from 'discord.js';
import { getGuild, getUser } from '#lib/database';
import { Events } from '#lib/types';
import { handleExperience } from '#lib/utilities/experience';

export class VoiceExperience extends Listener<typeof Events.VoiceChannelLeave> {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.VoiceChannelLeave,
		});
	}

	public async run(member: GuildMember, previous: VoiceState, start: string | null) {
		const result = await Result.fromAsync(async () => getUser(member.id));

		await result.match({
			ok: async data => this.handleOk(member, previous, start, data),
			err: error => this.container.logger.error(error),
		});
	}

	private async handleOk(member: GuildMember, previous: VoiceState, start: string | null, data: PrismaUser) {
		const { guild } = member;

		if (isNullish(start))
			return this.sendMessage(
				guild,
				`${member}, I must have been restarted while you were in a voice channel. It's so over....`,
			);

		const formatter = new DurationFormatter();
		const message = [];
		const end = Date.now();
		const elapsed = end - Number.parseInt(start, 10);
		const time = elapsed / Time.Minute;
		if (time < 1) return;

		const amount = Math.ceil(time * 2.5);

		const result = await handleExperience(amount, data);

		await result.match({
			ok: async data => {
				if (data === false) return;
				message.push(`Congratulations ${member}, you have leveled up to level ${data.level}!`);
			},
			err: async error => this.container.logger.error(error),
		});

		await this.container.prisma.user.update({
			where: { id: data.id },
			data: {
				Voice: {
					create: {
						channelId: previous.channelId!,
						guildId: previous.guild.id,
						date: new Date(),
						duration: elapsed,
						earned: amount,
					},
				},
			},
		});

		message.push(
			`${member}, You have earned ${bold(amount.toString())} for spending ${formatter.format(elapsed)} in VC.`,
		);
		await this.sendMessage(guild, message.join('\n'));
	}

	private async sendMessage(guild: Guild, message: string) {
		const guildResult = await Result.fromAsync(async () => getGuild(guild.id));
		if (guildResult.isErr()) throw guildResult.unwrapErr();
		const { voiceChannelId } = guildResult.unwrap();
		if (!voiceChannelId) return;
		const channel = guild.channels.cache.get(voiceChannelId);
		if (!isTextBasedChannel(channel)) {
			console.log('Voice channel is not a text channel');
			return;
		}

		return channel.send({ content: message });
	}
}
