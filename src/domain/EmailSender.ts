export type Attachment = {
	content: Buffer | string;
	filename: string;
};

export type EmailInfo = {
	to: string[];
	subject?: string;
	text: string;
	html?: string;
	attachments?: Attachment[];
};

export interface IEmailSender {
	sendEmail: (info: EmailInfo) => Promise<void>;
}
