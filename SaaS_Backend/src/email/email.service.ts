import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // host:${process.env.HIL_HOST}, // Microsoft 365 SMTP server
      // port:process.env.HIL_PORT, // SMTP port (587 for TLS, 465 for SSL)
      // secure: false, // true for 465, false for other ports
      // auth: {
      //   user: 'youremail@example.com', // Your Microsoft 365 email address
      //   pass: 'yourpassword', // Your Microsoft 365 email password or app password
      // },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: any,
    attachment?: any,
    cc?: any,
  ) {
    const fs = require('fs');
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: `${process.env.HIL_HOST}`,
      port: `${process.env.HIL_PORT}`,
      secure: false,
    });
    const mailOptions = {
      from: `"${process.env.HIL_FROM_DISPLAY_NAME}" <${process.env.HIL_FROM}>`, // Sender's email address
      to, // Recipient's email address
      cc: cc?.join(','),
      subject, // Email subject
      text, // Email content
      html,
      attachments: [],
    };
    if (attachment?.length>0) {
      const attachmentContent = fs.readFileSync(attachment?.path);
      const encodedContent = attachmentContent.toString('base64');
      mailOptions.attachments.push({
        filename: attachment.originalname, // Set filename
        content: encodedContent, // Set attachment content
        encoding: 'base64', // Specify content encoding
      });
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      return info; // Return the result of the sendMail call
    } catch (error) {}
  }
  async sendEmailMRM(
    to: string,
    cc: string[] = [],
    subject: string,
    text: string,
    html?: any,
    attachments: any[] = [], // Expecting an array of attachments
  ) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.HIL_HOST,
      port: parseInt(process.env.HIL_PORT, 10), // Ensure port is an integer
      secure: false,
    });

    const mailOptions = {
      from: `"${process.env.HIL_FROM_DISPLAY_NAME}" <${process.env.HIL_FROM}>`, // Sender's email address
      to, // Recipient's email address
      cc: cc?.join(','), // CC emails (optional)
      subject, // Email subject
      text, // Plain text content
      html, // HTML content
      attachments: [], // Empty attachments array to start
    };

    // Check if attachments are provided
    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        try {
          // console.log('Processing attachment:', attachment);

          // Check if content is a Buffer (binary data)
          // if (Buffer.isBuffer(attachment.content)) {
          // console.log('Attachment content is a Buffer');

          // Convert Buffer to base64
          //const base64Content = attachment.content.toString('base64');
          // console.log('Base64 Content:', base64Content.substring(0, 50)); // Log the first 50 chars for debugging

          // Add base64 content as an attachment
          // mailOptions.attachments.push({
          //   filename: attachment?.name || 'attachment.pdf', // Default filename if none provided
          //   content: base64Content, // Base64 content
          //   encoding: 'base64', // Specify base64 encoding
          //   contentType: attachment?.contentType || 'application/pdf', // MIME type, default to PDF
          // });

          mailOptions.attachments.push({
            filename: attachment.filename, // Set filename for the other attachments
            content: attachment.content, // The actual file content (could be base64, buffer, etc.)
            encoding: attachment.encoding || 'base64', // Default encoding is base64
            contentType: attachment.contentType || 'application/octet-stream', // Default MIME type
          });
          // } else if (typeof attachment.content === 'string') {
          //   // console.log('Attachment content is a string (base64)');

          //   // If content is a string (base64), just add it directly
          //   // mailOptions.attachments.push({
          //   //   filename: attachment?.name || 'attachment.pdf',
          //   //   content: attachment.content, // Directly use base64 string
          //   //   encoding: 'base64', // Base64 encoding
          //   //   contentType: attachment?.contentType || 'application/pdf', // MIME type
          //   // });

          //   mailOptions.attachments.push({
          //     filename: attachment.filename, // Set filename for the other attachments
          //     content: attachment.content, // The actual file content (could be base64, buffer, etc.)
          //     encoding: attachment.encoding || 'base64', // Default encoding is base64
          //     contentType: attachment.contentType || 'application/octet-stream', // Default MIME type
          //   });
          // } else {
          //   console.error(
          //     'Invalid attachment content type:',
          //     typeof attachment.content,
          //   );
          // }
        } catch (error) {
          console.error('Error handling attachment:', error);
        }
      }
    }

    // Send email with or without attachments
    try {
      const info = await transporter.sendMail(mailOptions);
      return info;
      // console.log('Email sent:', info);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendEmailWithInvite(
    to: string,
    subject: string,
    text: string,
    html?: any,
    attachment?: any,
    cc?: any,
    icalEvent?: { method?: string; content: string },
  ) {
    const fs = require('fs');
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.HIL_HOST,
      port: parseInt(process.env.HIL_PORT, 10),
      secure: false,
    });

    const mailOptions: any = {
      from: `"${process.env.HIL_FROM_DISPLAY_NAME}" <${process.env.HIL_FROM}>`,
      to,
      cc: cc?.join(','),
      subject,
      text,
      html,
      attachments: [],
    };

    if (attachment) {
      const attachmentContent = fs.readFileSync(attachment?.path);
      const encodedContent = attachmentContent.toString('base64');
      mailOptions.attachments.push({
        filename: attachment?.originalname,
        content: encodedContent,
        encoding: 'base64',
      });
    }

    if (icalEvent) {
      mailOptions.icalEvent = {
        method: icalEvent.method || 'REQUEST',
        content: icalEvent.content,
      };
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendBulkEmails(
    recipients: string[],
    subject: string,
    text: string,
    html?: string,
    attachment?: any,
  ) {
    const fs = require('fs');
    const nodemailer = require('nodemailer');
    if (recipients.length === 0) {
      throw new Error('No recipients provided');
    }

    const primaryRecipient = recipients[0]; // First email in the 'To' field
    const ccRecipients = recipients.slice(1); // Rest in the 'CC' field

    const transporter = nodemailer.createTransport({
      host: `${process.env.HIL_HOST}`,
      port: Number(process.env.HIL_PORT),
      secure: false, // True for 465, false for other ports
    });

    const mailOptions: any = {
      from: `"${process.env.HIL_FROM_DISPLAY_NAME}" <${process.env.HIL_FROM}>`,
      to: primaryRecipient,
      cc: ccRecipients.join(','),
      subject,
      text,
      html,
      attachments: [],
    };

    if (attachment) {
      const attachmentContent = fs.readFileSync(attachment?.path);
      const encodedContent = attachmentContent.toString('base64');
      mailOptions.attachments.push({
        filename: attachment.originalname, // Set filename
        content: encodedContent, // Set attachment content
        encoding: 'base64', // Specify content encoding
      });
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, info }; // Return the result of the sendMail call
    } catch (error) {
      console.log('Error sending bulk emails', error);

      return { success: false, error }; // Return error if sending fails
    }
  }
  async sendEmailwithICS(
    to: string,
    subject: string,
    text: string,
    html?: any,
    attachment?: any,
  ) {
    const fs = require('fs');
    const nodemailer = require('nodemailer');

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.HIL_HOST,
      port: parseInt(process.env.HIL_PORT, 10), // Ensure port is an integer
      secure: false,
    });
    // console.log('calling mail functions');
    // Log the attachment for debugging
    // console.log('attachment', attachment);

    // Define the mail options
    const mailOptions = {
      from: `"${process.env.HIL_FROM_DISPLAY_NAME}" <${process.env.HIL_FROM}>`, // Sender's email address
      to, // Recipient's email address
      subject, // Email subject
      text, // Email content
      html,
      attachments: [],
    };

    // Handle attachment
    if (attachment) {
      // Read the file content
      const attachmentObject = {
        filename: attachment.filename || 'attachment.ics', // Set filename
        content: attachment.content, // Directly use content
        encoding: 'utf-8', // Use utf-8 encoding for plain text files
        contentType: 'text/calendar', // Correct MIME type for iCalendar
      };

      // Add the attachment to mailOptions
      mailOptions.attachments.push(attachmentObject);
    }

    try {
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      return info; // Return the result of the sendMail call
    } catch (error) {
      // Handle errors
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
  async sendEmailwithICSandFiles(
    to: string,
    cc: string[] = [], // Add cc as an array of strings (emails)
    subject: string,
    text: string,
    html?: any,
    attachments: any[] = [], // Expecting an array of attachments
  ) {
    const fs = require('fs');
    const nodemailer = require('nodemailer');

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.HIL_HOST,
      port: parseInt(process.env.HIL_PORT, 10), // Ensure port is an integer
      secure: false,
    });

    // Define the mail options
    const mailOptions = {
      from: `"${process.env.HIL_FROM_DISPLAY_NAME}" <${process.env.HIL_FROM}>`, // Sender's email address
      to, // Recipient's email address
      cc: cc.join(','), // Adding CCs as a comma-separated string
      subject, // Email subject
      text, // Email content
      html,
      attachments: [], // Initialize an empty array for attachments
    };

    // Handle `.ics` file attachment
    const icsAttachment = attachments.find(
      (attachment) => attachment.filename === 'meeting.ics',
    );

    if (icsAttachment) {
      // Add the ICS attachment to mailOptions
      mailOptions.attachments.push({
        filename: icsAttachment.filename || 'meeting.ics', // Set filename for ICS
        content: icsAttachment.content, // The actual ICS content
        encoding: 'utf-8', // Encoding for plain text or calendar
        contentType: 'text/calendar', // MIME type for iCalendar
      });
    }

    // Handle other attachments (e.g., additional files in the meeting)
    const otherAttachments = attachments.filter(
      (attachment) => attachment.filename !== 'meeting.ics',
    );

    // Add other attachments to the mailOptions
    otherAttachments.forEach((attachment) => {
      mailOptions.attachments.push({
        filename: attachment.filename, // Set filename for the other attachments
        content: attachment.content, // The actual file content (could be base64, buffer, etc.)
        encoding: attachment.encoding || 'base64', // Default encoding is base64
        contentType: attachment.contentType || 'application/octet-stream', // Default MIME type
      });
    });

    try {
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      return info; // Return the result of the sendMail call
    } catch (error) {
      // Handle errors
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
