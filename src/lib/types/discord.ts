import type { GuildMember, Message } from 'discord.js';

export type GuildMessage = Message<true> & { member: GuildMember };

export const Events = {
	VoiceChannelJoin: 'voiceChannelJoin' as const,
	VoiceChannelLeave: 'voiceChannelLeave' as const,
	VoiceChannelSwitch: 'voiceChannelSwitch' as const,
	VoiceMute: 'voiceMute' as const,
	VoiceUnmute: 'voiceUnmute' as const,
	VoiceDeaf: 'voiceDeaf' as const,
	VoiceUndeaf: 'voiceUndeaf' as const,
	VoiceStreamStart: 'voiceStreamStart' as const,
	VoiceStreamStop: 'voiceStreamStop' as const,
};

declare const FrogEvents: typeof Events;

declare module 'discord.js' {
	interface ClientEvents {
		[FrogEvents.VoiceChannelJoin]: [member: GuildMember, next: VoiceState];
		[FrogEvents.VoiceChannelLeave]: [member: GuildMember, previous: VoiceState, data: string | null];
		[FrogEvents.VoiceChannelSwitch]: [previous: VoiceState, next: VoiceState];
		[FrogEvents.VoiceMute]: [member: GuildMember, next: VoiceState];
		[FrogEvents.VoiceUnmute]: [member: GuildMember, previous: VoiceState];
		[FrogEvents.VoiceDeaf]: [member: GuildMember, next: VoiceState];
		[FrogEvents.VoiceUndeaf]: [member: GuildMember, previous: VoiceState];
		[FrogEvents.VoiceStreamStart]: [member: GuildMember, next: VoiceState];
		[FrogEvents.VoiceStreamStop]: [member: GuildMember, previous: VoiceState];
	}
}
