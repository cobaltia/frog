import { PrismaClient } from '@prisma/client';
import { container } from '@sapphire/framework';

const prisma = new PrismaClient();

container.prisma = prisma;

declare module '@sapphire/framework' {
	interface Container {
		prisma: PrismaClient;
	}
}
