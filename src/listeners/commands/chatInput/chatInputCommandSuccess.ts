import { type Events, Listener, type ChatInputCommandSuccessPayload } from '@sapphire/framework';
import { handleChatInputOrContextMenuCommandSuccess } from '#utilities/functions/successHelper';

export class ChatInputCommandSuccessListener extends Listener<typeof Events.ChatInputCommandSuccess> {
	public override run(payload: ChatInputCommandSuccessPayload) {
		return handleChatInputOrContextMenuCommandSuccess(payload);
	}
}
