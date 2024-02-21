import { Resend } from "resend";

import { EmailInfo, IEmailSender } from "@domain/EmailSender";

class ResendEmailSender implements IEmailSender {
	private sender: Resend;
	private fromEmail: string;

	constructor(apiKey: string, fromEmail: string) {
		this.sender = new Resend(apiKey);
		this.fromEmail = fromEmail;
	}

	public async sendEmail(info: EmailInfo): Promise<void> {
		const response = await this.sender.emails.send({
			from: this.fromEmail,
			to: info.to,
			subject: info.subject,
			text: info.text,
			html: info.html,
			attachments: info.attachments,
		});

		if (response.error) {
		} else {
		}
	}
}

export default ResendEmailSender;
