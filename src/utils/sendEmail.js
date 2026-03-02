// ses.js

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
    region: "ap-south-1", 
});

async function sendMail(to, subject, text, html) {
    const params = {
        Source: "aditya262701@gmail.com", 
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: "UTF-8",
            },
            Body: {
                Text: {
                    Data: text,
                    Charset: "UTF-8",
                },
                Html: {
                    Data: html,
                    Charset: "UTF-8",
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log("Email sent:", response.MessageId);
        return response;
    } catch (error) {
        console.error("SES Error:", error);
        throw error;
    }
}

module.exports = sendMail;