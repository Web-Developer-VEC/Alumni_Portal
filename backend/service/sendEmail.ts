import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../config/aws.js";

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const fromAddress = process.env.EMAIL_FROM;

    if (!fromAddress) {
      throw new Error("EMAIL_FROM is not defined in environment variables");
    }

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: text,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: fromAddress,
    });

    const response = await sesClient.send(command);
    console.log("Email sent successfully via SES. MessageId:", response.MessageId);
    return true;
  } catch (error) {
    console.error("Error sending email via SES:", error);
    return false;
  }
};
