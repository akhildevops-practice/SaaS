/**
 *  This file defines all of the helper functions for sending email messages. Any changes to email text being sent can be
 *  chnaged here appropriately.
 */

import { InternalServerErrorException } from '@nestjs/common/exceptions';
// import * as moment from 'moment';
import * as sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SMTP_PASSWORD);
import * as moment from 'moment-timezone';

import axios from 'axios';

// export const sendMRMAttendeesEmail = async (
//   attendees: any,
//   data: any,
//   userTable: any,
//   organization: any,
//   currentUser: any,
//   mailService,
// ) => {
//   const pendingPromises = [];
//   let emailMessage = ``;

//   let date = moment(data?.meetingdate ?? new Date());
//   let dateComponent = date.format('DD-MM-YYYY');

//   // Prepare the list of participants in an ordered list format
//   const participantsList =
//     data?.participants
//       ?.map((participant, index) => `<li>${participant?.fullname} </li>`)
//       .join('') || '';
//   const cleanDescription = data?.minutesofMeeting?.replace(/<[^>]*>/g, '');
//   // Prepare email content for HTML
//   const emailMessageIP = `
//   <html>
//     <body>
//       <p>Hello, ${attendees?.fullname}</p>

//       <p><strong>MoM ${
//         data?.meetingName
//       }</strong> has been conducted by <strong>${
//     currentUser?.firstname
//   }</strong> on <strong>${dateComponent}</strong>.

//       <p><strong>Minutes of Meeting:</strong></p>
//       <p style="font-style: italic; color: #555;">${
//         cleanDescription || 'No minutes available.'
//       }</p>

//       <p><strong>Agenda and Decisions:</strong></p>
//       <ol>
//         ${
//           data?.agenda && data?.agenda?.length > 0
//             ? data?.agenda
//                 .map((item) => {
//                   return `<li><strong>Agenda:</strong> ${item.agenda} <br> <strong>Decision:</strong> ${item.decision}</li>`;
//                 })
//                 .join('')
//             : 'No agenda and decisions available.'
//         }
//       </ol>

//       <p><strong>Participants:</strong></p>
//       <ol>
//         ${participantsList}
//       </ol>
//       Please click on the link to view details:</p>
//       <p>Here is the link: <a href="${process.env.PROTOCOL}://${
//     process.env.REDIRECT
//   }/mrm/mrm">Click here</a></p>

//       <p>Regards,<br>${currentUser?.firstname} ${currentUser?.lastname}</p>
//     </body>
//   </html>
// `;

//   // Prepare email content for plain text (optional, in case some clients don't support HTML)
//   emailMessage = `Hello, ${attendees?.username}

//   MoM ${data?.meetingName} has been conducted by ${
//     currentUser?.firstname
//   } on ${dateComponent}. Please click on the link to view Agenda:
//   Here is the link: ${process.env.PROTOCOL}://${process.env.REDIRECT}/mrm/mrm

//   Participants:
//   ${data?.participants
//     ?.map(
//       (participant, index) =>
//         `${index + 1}. ${participant.firstname} ${participant.lastname}`,
//     )
//     .join('\n')}

//   Regards,
//   ${currentUser?.firstname} ${currentUser?.lastname}`;

//   const msg = {
//     to: attendees?.email,
//     from: process.env.FROM,
//     subject: `MoM of ${data.meetingName}`,
//     html: emailMessageIP,
//     text: emailMessage,
//     attachments: [],
//   };

//   // Add attachments to the email (if any)
//   if (data?.attachments && data?.attachments?.length > 0) {
//     for (const attachment of data?.attachments) {
//       if (attachment?.url) {
//         try {
//           // Fetch the file content from the URL (assuming it's a URL that returns the file as content)
//           const fileResponse = await axios.get(attachment?.url, {
//             responseType: 'arraybuffer',
//           });

//           // Convert the file content into base64
//           const base64Content = fileResponse?.data?.toString('base64');

//           msg.attachments.push({
//             filename: attachment?.name || 'attachment.pdf', // Attachment filename
//             content: base64Content, // Attach the base64 encoded file content
//             encoding: 'base64', // Ensure it's base64 encoded
//             contentType: attachment.contentType || 'application/pdf', // MIME type (defaulting to PDF)
//           });
//         } catch (error) {
//           console.error('Error fetching file from URL:', error);
//         }
//       } else if (attachment?.content) {
//         // If content is provided directly, attach it
//         msg.attachments.push({
//           filename: attachment?.name || 'attachment.pdf',
//           content: attachment?.content, // Direct attachment content (should be base64 encoded)
//           encoding: 'utf-8',
//           contentType: attachment?.contentType || 'application/pdf',
//         });
//       }
//     }
//   }

//   // Sending email via IP-based system or SendGrid
//   if (process.env.MAIL_SYSTEM === 'IP_BASED') {
//     // Sending email via IP-based mail service
//     try {
//       const result = await mailService(
//         attendees.email,
//         `MoM of ${data.meetingName}`,
//         '',
//         emailMessageIP,
//         msg.attachments,
//       );
//     } catch (error) {}

//     console.log('Mail sent via IP-based system');
//   } else {
//     // Sending email via SendGrid (or similar)
//     const finalResult = await sgMail.send(msg);
//     console.log('Email sent via SendGrid');
//   }
// };
export const sendMRMAttendeesEmail = async (
  attendees: any,
  data: any,
  // userTable: any,
  // organization: any,
  currentUser: any,
  mailService,
  docService, // Added docService for IP-based fetch
) => {
  const pendingPromises = [];
  let emailMessage = ``;

  let date = moment(data?.meetingdate ?? new Date());
  let dateComponent = date.format('DD-MM-YYYY');

  // Prepare the list of participants in an ordered list format
  const participantsList =
    data?.participants
      ?.map((participant, index) => `<li>${participant?.fullname} </li>`)
      .join('') || '';
  const cleanDescription = data?.minutesofMeeting?.replace(/<[^>]*>/g, '');

  // Prepare email content for HTML
  const emailMessageIP = `
  <html>
    <body>
      <p>Hello, ${attendees?.fullname}</p>
      <p><strong>MoM ${
        data?.meetingName
      }</strong> has been conducted by <strong>${
    currentUser?.firstname
  }</strong> on <strong>${dateComponent}</strong>.</p>
      
      <p><strong>Minutes of Meeting:</strong></p>
      <p style="font-style: italic; color: #555;">${
        cleanDescription || 'No minutes available.'
      }</p>
      
      <p><strong>Agenda and Decisions:</strong></p>
      <ol>
        ${
          data?.agenda && data?.agenda?.length > 0
            ? data?.agenda
                .map((item) => {
                  return `<li><strong>Agenda:</strong> ${item.agenda} <br> <strong>Decision:</strong> ${item.decision}</li>`;
                })
                .join('')
            : 'No agenda and decisions available.'
        }
      </ol>
      
      <p><strong>Participants:</strong></p>
      <ol>
        ${participantsList}
      </ol>
      Please click on the link to view details:</p>
      <p>Here is the link: <a href="${process.env.PROTOCOL}://${
    process.env.REDIRECT
  }/mrm/mrm">Click here</a></p>

      <p>Regards,<br>${currentUser?.firstname} ${currentUser?.lastname}</p>
    </body>
  </html>
`;

  // Prepare email content for plain text (optional)
  emailMessage = `Hello, ${attendees?.username}

  MoM ${data?.meetingName} has been conducted by ${
    currentUser?.firstname
  } on ${dateComponent}. Please click on the link to view Agenda:
  Here is the link: ${process.env.PROTOCOL}://${process.env.REDIRECT}/mrm/mrm

  Participants:
  ${data?.participants
    ?.map(
      (participant, index) =>
        `${index + 1}. ${participant.firstname} ${participant.lastname}`,
    )
    .join('\n')}

  Regards,
  ${currentUser?.firstname} ${currentUser?.lastname}`;

  const msg = {
    to: attendees?.email,
    from: process.env.FROM,
    subject: `MoM of ${data.meetingName}`,
    html: emailMessageIP,
    text: emailMessage,
    attachments: [],
  };

  // Add attachments to the email (if any)
  if (data?.attachments && data?.attachments?.length > 0) {
    for (const attachment of data?.attachments) {
      if (attachment?.url) {
        // Check if the mail system is IP-based
        if (process.env.MAIL_SYSTEM === 'IP_BASED') {
          try {
            // Fetch file from object storage (docService)
            const fileResponse = await docService(attachment?.url, '1234'); // Adjust the params based on your service
            const buffer = fileResponse;
            const uint8Array = new Uint8Array(buffer.data);
            const blob = new Blob([uint8Array], {
              type: 'application/octet-stream',
            });

            // Convert the file content into base64
            const base64Content: any = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = (error) => reject(error);
              reader.readAsDataURL(blob);
            });

            // Push the attachment to the message
            msg.attachments.push({
              filename: attachment?.name || 'attachment.pdf', // Default filename
              content: base64Content.split(',')[1], // Base64 content without prefix
              encoding: 'base64',
              contentType: attachment?.contentType || 'application/pdf',
            });
          } catch (error) {
            console.error('Error fetching file from object storage:', error);
          }
        } else {
          // For SendGrid: Fetch file from URL
          try {
            const fileResponse = await axios.get(attachment?.url, {
              responseType: 'arraybuffer',
            });

            // Convert the file content into base64
            const base64Content = Buffer.from(fileResponse.data).toString(
              'base64',
            );

            // Push the attachment to the message
            msg.attachments.push({
              filename: attachment?.name || 'attachment.pdf',
              content: base64Content,
              encoding: 'base64',
              contentType: attachment?.contentType || 'application/pdf',
            });
          } catch (error) {
            console.error('Error fetching file from URL:', error);
            // Fallback: Proceed without attachments even if fetching from URL fails
          }
        }
      } else if (attachment?.content) {
        // If content is provided directly, attach it
        msg.attachments.push({
          filename: attachment?.name || 'attachment.pdf',
          content: attachment?.content,
          encoding: 'utf-8',
          contentType: attachment.contentType || 'application/pdf',
        });
      }
    }
  }

  // Sending email via IP-based system or SendGrid
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      // Sending email via IP-based mail service
      await mailService(
        attendees.email,
        `MoM of ${data.meetingName}`,
        '',
        emailMessageIP,
        msg.attachments,
      );
      console.log('Mail sent via IP-based system');
    } else {
      // Sending email via SendGrid (or similar)
      await sgMail.send(msg);
      console.log('Email sent via SendGrid');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendMailToOwner = async (
  owner,
  item,
  meetingSchedule,
  activeUser,
  mailService,
) => {
  const dates = meetingSchedule.date;

  const formattedDates = dates?.map((dateObj: any) => {
    const { date, from, to } = dateObj;
    const formattedDate = date ? moment(date).format('DD/MM/YYYY') : '';
    const formattedFrom = from ? from : '';
    const formattedTo = to ? to : '';
    return `Date:${formattedDate} From:${formattedFrom} - To:${formattedTo}`;
  });
  let agendaOwnerMappings;
  // console.log('meeting scheudle', meetingSchedule);
  if (
    !!meetingSchedule.keyAgendaId &&
    meetingSchedule?.keyAgendaId?.length > 0
  ) {
    agendaOwnerMappings = meetingSchedule?.keyAgendaId?.map((agendaItem) => {
      // Extract agenda details
      const agenda = agendaItem.agenda;

      // Map over each owner in the owner array for the current agenda item

      if (agendaItem?.owner && agendaItem?.owner?.length > 0) {
        const owners = agendaItem.owner?.map((owner) => {
          // Extract owner details
          return `${owner.fullname} (${owner.email})`;
        });

        // Combine owner names into a single string
        const ownersString = owners.join(', ');

        // Format the result
        return `Agenda - ${agenda}, Owner(s) - ${ownersString}`;
      }
    });
  }
  const icsContent = generateICS(meetingSchedule, owner, activeUser);
  const emailMessageIP = `
   Hello, ${owner?.username}
   A new meeting schedule has been created and you are invited. The details are
   Meeting Schedule : ${meetingSchedule?.meetingName}
   Description:${meetingSchedule?.description}
   Organized by:${activeUser?.firstname} 
   Venue:${meetingSchedule?.venue}
   Agenda(s) For the Meeting:
   ${agendaOwnerMappings?.join('\n')} 
   and you have been assigned as the owner for the agenda ${item?.agenda}
   
   Here are the meeting dates:
  
   ${formattedDates?.join('\n')}
   
   Here is the link "${process.env.PROTOCOL}://${
    process.env.REDIRECT
  }/mrm/mrm" click for details
       `;
  const emailMessage = `
   <p>Hello, ${owner?.username}</p>
   <p>
   A new meeting schedule has been created and you are invited. The details are</p>
   <p>Meeting Schedule : ${meetingSchedule?.meetingName}</p>
  <p> Organized by:${activeUser?.firstname} </p>
  <p>Description:${meetingSchedule?.description}</p>
   <p>Venue:${meetingSchedule?.venue}</p>
  <p> Agenda(s) For the Meeting:</p>
  <p> ${agendaOwnerMappings?.join('<br/>')} </p>
   and you have been assigned as the owner for the agenda ${item?.agenda}
   
   
   <p>
     Here are the meeting dates:<br/>
     ${formattedDates?.join('<br/>')}
   </p>
   <p>
     Here is the link <a href="${process.env.PROTOCOL}://${
    activeUser?.organization.realmName
  }.${process.env.REDIRECT}/mrm/mrm">click for details</a>
   </p>
       `;

  const msg = {
    to: owner?.email, // attendee
    from: process.env.FROM, // MR
    subject: `${meetingSchedule.meetingName} Meeting has been scheduled  `,
    html: `<div>${emailMessage}</div>`,
    attachments: [
      {
        content: Buffer.from(icsContent).toString('base64'),
        filename: 'meeting.ics',
        type: 'text/calendar',
        disposition: 'attachment',
      },
    ],
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        owner.email,
        `${meetingSchedule.meetingName} Meeting has been scheduled `,
        '',
        emailMessageIP,
        {
          filename: 'meeting.ics',
          content: icsContent, // Directly use the content as plain text
          encoding: 'utf-8', // Use 'utf-8' encoding for plain text
          contentType: 'text/calendar', // Set correct MIME type for iCalendar
        },
      );
      // //console.log('sent mail');
    } else {
      try {
        const finalResult = await sgMail.send(msg);
        // //console.log('sent mail');
      } catch (error) {
        throw error;
      }
    }
    //////console.log('mail sent in review');
  } catch (error) {
    if (error.response && error.response.body && error.response.body.errors) {
      // Log or handle specific errors from SendGrid
      // console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      // console.error('An error occurred:', error.message);
    }
  }
};
export const sendMailToParticipants = async (
  owner,
  meetingSchedule,
  activeUser,
  mailService,
) => {
  const dates = meetingSchedule.date;

  const formattedDates = dates?.map((dateObj: any) => {
    const { date, from, to } = dateObj;
    const formattedDate = date ? moment(date).format('DD/MM/YYYY') : '';
    const formattedFrom = from ? from : '';
    const formattedTo = to ? to : '';
    return `Date: ${formattedDate} From: ${formattedFrom} - To: ${formattedTo}`;
  });

  let agendaOwnerMappings;
  if (
    !!meetingSchedule.keyAgendaId &&
    meetingSchedule?.keyAgendaId?.length > 0
  ) {
    agendaOwnerMappings = meetingSchedule?.keyAgendaId.map((agendaItem) => {
      // Extract agenda details
      const agenda = agendaItem.agenda;

      // Map over each owner in the owner array for the current agenda item
      let owners;
      if (agendaItem?.owner && agendaItem?.owner?.length > 0) {
        owners = agendaItem.owner.map((owner) => {
          // Extract owner details
          return `${owner.fullname} (${owner.email})`;
        });

        // Combine owner names into a single string
        const ownersString = owners.join(', ');

        // Format the result
        return `${agenda} - ${ownersString}`;
      }
    });
  }

  const icsContent = generateICS(meetingSchedule, owner, activeUser);
  const cleanDescription = meetingSchedule?.description?.replace(
    /<[^>]*>/g,
    '',
  );

  const emailMessageIP = `
  <html>
    <body>
      <p>Hello, ${owner?.firstname ? owner?.firstname : owner?.username},</p>
      
      <p><strong>${
        meetingSchedule?.meetingName
      }</strong> has been scheduled on <strong>${formattedDates?.join(
    '<br>',
  )}</strong> by <strong>${activeUser?.firstname}</strong> at <strong>${
    meetingSchedule?.venue
  }</strong>.</p>
      
      <p><strong>Agenda:</strong></p>
      <ol>
        ${
          agendaOwnerMappings
            ? agendaOwnerMappings
                .map((item) => `<li>${item}</li>`) // Removed index + 1
                .join('')
            : ''
        }
      </ol>
      
      <p><strong>Meeting Description:</strong></p>
      <p style="font-style: italic; color: #555;">${cleanDescription}</p>
      
      <p>Here is the link for more details: <a href="${
        process.env.PROTOCOL
      }://${process.env.REDIRECT}/mrm/mrm" target="_blank">Click here</a></p>
    </body>
  </html>
`;

  const emailMessage = `
   <p>Hello, ${owner?.firstname ? owner?.firstname : owner?.username}</p>
   <p><strong>${
     meetingSchedule?.meetingName
   }</strong> has been scheduled on ${formattedDates?.join(
    '<br>',
  )} by <strong>${activeUser?.firstname}</strong> at ${
    meetingSchedule?.venue
  }.</p>
   <p>These are the agenda(s) for the meeting:</p>
   <ul>
     ${agendaOwnerMappings
       ?.map((item, index) => `<li>${index + 1}. ${item}</li>`)
       .join('')}
   </ul>
   <p><strong>Meeting Description:</strong></p>
   <p>${cleanDescription}</p>
   <p>Here is the link: <a href="${process.env.PROTOCOL}://${
    activeUser?.organization.realmName
  }.${process.env.REDIRECT}/mrm/mrm">Click here for details</a></p>
  `;

  const msg = {
    to: owner?.email,
    from: process.env.FROM,
    subject: `${meetingSchedule.meetingName} Meeting has been scheduled`,
    html: `<div>${emailMessageIP}</div>`,
    attachments: [
      {
        content: Buffer.from(icsContent).toString('base64'),
        filename: 'meeting.ics',
        type: 'text/calendar',
        disposition: 'attachment',
      },
    ],
  };

  const mailOptions = {
    from: process.env.FROM, // sender address
    to: owner?.email, // list of receivers
    subject: `${meetingSchedule.meetingName} Meeting has been scheduled`, // Subject line
    html: emailMessageIP, // html body
    attachments: [
      {
        filename: 'meeting.ics',
        content: icsContent,
        encoding: 'base64',
        contentType: 'text/calendar',
      },
    ],
  };

  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        owner.email,
        `${meetingSchedule.meetingName} Meeting has been scheduled`,
        'This is the plain text version of the email',
        emailMessageIP,
        {
          filename: 'meeting.ics',
          content: icsContent,
          encoding: 'utf-8',
          contentType: 'text/calendar',
        }, // Attach the .ics file
      );
    } else {
      try {
        const finalResult = await sgMail.send(msg);
        console.log('sent mail');
      } catch (error) {
        console.log('error', error);
        throw error;
      }
    }
  } catch (error) {
    if (error.response && error.response.body && error.response.body.errors) {
      // Log or handle specific errors from SendGrid
      // console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      // console.error('An error occurred:', error.message);
    }
  }
};

const generateICS = (meetingSchedule, owner, activeUser) => {
  const { meetingName, venue, date } = meetingSchedule;

  // Generate VEVENT entries for each date
  const events = date
    .map((dateObj, index) => {
      const { date, from, to } = dateObj;

      // Format start and end times with timezone
      const start = moment
        .tz(`${date} ${from}`, 'Asia/Kolkata')
        .format('YYYYMMDDTHHmmss');
      const end = moment
        .tz(`${date} ${to}`, 'Asia/Kolkata')
        .format('YYYYMMDDTHHmmss');

      return [
        'BEGIN:VEVENT',
        `SUMMARY:${meetingName}`,
        `LOCATION:${venue}`,
        `DESCRIPTION:Meeting organized by ${activeUser.firstname}`,
        `UID:${owner.email}-${start}-${index}`,
        `DTSTART;TZID=Asia/Kolkata:${start}`,
        `DTEND;TZID=Asia/Kolkata:${end}`,
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  // Create the full calendar file with timezone info
  const calendarLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your Organization//NONSGML v1.0//EN',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Kolkata',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0530',
    'TZOFFSETTO:+0530',
    'TZNAME:IST',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE',
    events, // Include all events
    'END:VCALENDAR',
  ];

  return calendarLines.join('\r\n');
};
