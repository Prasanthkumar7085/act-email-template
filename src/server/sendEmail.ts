import { createServerFn } from "@tanstack/react-start";

type SendEmailParams = {
    to: string[];
    subject: string;
    htmlContent: string;
};

export const sendEmail = createServerFn({ method: "POST" }).inputValidator((data: SendEmailParams) => data).handler(
    async ({ data }) => {

        if (!data?.to || !data?.subject || !data?.htmlContent) {
            throw new Error("Missing required email parameters");
        }

        const url = `${process.env.BREVO_URL}/smtp/email`;
        const apiKey = process.env.BREVO_API_KEY!;
        const senderEmail = process.env.BREVO_USER_EMAIL!;
        const senderName = process.env.BREVO_USER_NAME!;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                sender: {
                    email: senderEmail,
                    name: senderName,
                },
                to: data.to.map((email) => ({ email })),
                subject: data.subject,
                htmlContent: data.htmlContent,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Brevo API error: ${error}`);
        }

        return { success: true };
    }
);
