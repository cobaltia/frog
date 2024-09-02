import { isNullishOrEmpty } from '@sapphire/utilities';
import type { Message, User } from 'discord.js';
import type { GuildMessage } from '#lib/types';

export function isGuildMessage(message: Message): message is GuildMessage {
	return message.guild !== null;
}

export function isUniqueUsername(user: User) {
	return isNullishOrEmpty(user.discriminator) || user.discriminator === '0';
}

export function getTag(user: User) {
	return isUniqueUsername(user) ? `${user.username}` : `${user.username}#${user.discriminator}`;
}
