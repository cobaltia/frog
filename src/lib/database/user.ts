import { Prisma, type User } from '@prisma/client';
import { Result, container, err } from '@sapphire/framework';

export async function getUser(id: string): Promise<Result<User, unknown>> {
	const result = await Result.fromAsync(async () => container.prisma.user.findUniqueOrThrow({ where: { id } }));

	if (result.isErr()) {
		const error = result.unwrapErr();
		if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')) return err(error);
		return Result.fromAsync(async () => container.prisma.user.create({ data: { id } }));
	}

	return result;
}
