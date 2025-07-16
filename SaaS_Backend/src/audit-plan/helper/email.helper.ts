import { InternalServerErrorException } from '@nestjs/common/exceptions';
import * as moment from 'moment-timezone';
import * as sgMail from '@sendgrid/mail';
import * as dayjs from 'dayjs';

sgMail.setApiKey(
  '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',
);


export const sendMailToHeadOnAuditPlan = async (
  user,
  auditPlan,
  activeUser,
  mailService,
) => {
  const emailMessageIP = `
  Hello,

  Following Audit Plan: ${auditPlan.auditName} has been created and sent for your reference. 
  Click on the link to view:

  "${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/auditplan/auditplanform/${auditPlan._id}"

  From,
  ${activeUser.firstname} ${activeUser.lastname}
`;

  const emailMessage = `
  <p>Hello,</p>
  <p>Following Audit Plan: <strong>${auditPlan.auditName}</strong> has been created and sent for your reference.</p>
  <p>Click on the link to view:</p>
  <p>"${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/audit/auditplan/auditplanform/${auditPlan._id}"</p>
  <p>From,</p>
  <p>${activeUser.firstname} ${activeUser.lastname}</p>
`;

  const msg = {
    to: user?.email,
    from: process.env.FROM,
    subject: `Audit Plan has been sent for your reference`,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `Audit Plan has been sent for your reference`,
        emailMessageIP,
      );
      //console.log('sent mail');
    } else {
      try {
        const finalResult = await sgMail.send(msg);
        ////console.log('sent mail');
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

export const sendMailToHeadOnAuditSchedule = async (
  [user, ...users],
  auditSchedule,
  activeUser,
  mailService,
  // realmName
) => {
  const emailMessageIP = `
          Hello,

          Following Audit Schedule: ${
            auditSchedule?.auditScheduleName
          } has been created and sent for your reference.
          Audit Type: ${auditSchedule?.auditType}
            Audited Entity:${auditSchedule?.entityName || ''}
          Audit Date: ${auditSchedule?.time}
          Auditors: ${auditSchedule?.auditor
            .map((auditor) => auditor?.username)
            .join(' , ')}
          Auditees: ${auditSchedule?.auditee
            .map((auditee) => auditee?.username)
            .join(' , ')}

          Click on the link to view:
          "${process.env.PROTOCOL}://${activeUser?.organization?.realmName}.${
    process.env.REDIRECT
  }/audit/auditschedule/auditscheduleform/schedule/${auditSchedule?._id}"

          From,
          ${activeUser.firstname} ${activeUser.lastname}
    `;

  const emailMessage = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>New NC Raised</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
            }
            .email-container {
              margin: 0 auto;
              padding: 20px;
              max-width: 600px;
              background-color: #fff;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
            }
            .email-container h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            .email-content {
              text-align: justify;
            }
            .button {
              display: inline-block;
              background-color: #007bff;
              color: #fff;
              padding: 10px 20px;
              border-radius: 5px;
              text-decoration: none;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-content">
              <p>Hello,</p>
              <p>Following Audit Schedule: <strong>${
                auditSchedule?.auditScheduleName
              }</strong> has been created and sent for your reference.</p>
              <ul>
                <li>Audit Type: ${auditSchedule?.auditType}</li>
                <li>Audited Entity :${auditSchedule?.entityName || ''}</li>

                <li>Audit Date: ${auditSchedule?.time}</li>
                <li>Auditors: ${auditSchedule?.auditor
                  .map((auditor) => auditor?.username)
                  .join(' , ')}</li>
                <li>Auditees: ${auditSchedule?.auditee
                  .map((auditee) => auditee?.username)
                  .join(' , ')}</li>
              </ul>
              <p>Click on the link to view:</p>
              <p>
                ${process.env.PROTOCOL}://${activeUser?.organization?.realmName}.${
    process.env.REDIRECT
  }/audit/auditschedule/auditscheduleform/schedule/${auditSchedule?._id}
                  
              </p>
              <p>From,<br />
              ${activeUser?.firstname} ${activeUser?.lastname}</p>
            </div>
          </div>
        </body>
      </html>
  `;
  const icsContent = generateICS(auditSchedule);
  const uniqueEmails = [...new Set(users?.map((value) => value?.email))];

  const msg = {
    // to: user?.email,
    to: user?.email,
    cc: uniqueEmails,
    from: process.env.FROM,
    subject: `Audit schedule for Audit Type ${auditSchedule?.auditScheduleName} has been scheduled`,
    html: `<div>${emailMessage}</div>`,
    attachments: [
      {
        content: Buffer.from(icsContent).toString('base64'),
        filename: 'audit-schedule.ics',
        type: 'text/calendar',
        disposition: 'attachment',
      },
    ],
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `Audit schedule for Audit Type ${auditSchedule?.auditScheduleName} has been scheduled`,
        emailMessageIP,
        null,
        [],
        uniqueEmails,
        { method: 'REQUEST', content: icsContent },
      );
    } else {
      try {
        const finalResult = await sgMail.send(msg);
      } catch (error) {
        console.error('Error sending email via SendGrid:', error);
        throw error;
      }
    }
  } catch (error) {
    if (error.response && error.response.body && error.response.body.errors) {
      return {
        error: error,
      };
      // Log or handle specific errors from SendGrid
      // console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      // console.error('An error occurred:', error.message);
    }
  }
};

export const sendMailForChangeAuditDate = async (
  [user, ...users],
  auditSchedule,
  activeUser,
  mailService,
) => {
  const emailMessageIP = `
  The following Audit Schedule has been updated, and the revised date has been shared for your reference.

  DepartMent/Vertical: ${auditSchedule?.entityName}
  Audit Date: ${dayjs(auditSchedule?.time).format('DD-MM-YYYY [T] HH:mm')}
  Auditors: ${auditSchedule?.auditor
    .map((auditor) => auditor?.username)
    .join(' , ')}
  Auditees: ${auditSchedule?.auditee
    .map((auditee) => auditee?.username)
    .join(' , ')}

  
  From,
  ${activeUser.firstname} ${activeUser.lastname}
`;

  // console.log('emailMessageIP',emailMessageIP)

  const emailMessage = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New NC Raised</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
          }
          .email-container {
            margin: 0 auto;
            padding: 20px;
            max-width: 600px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          }
          .email-container h1 {
            text-align: center;
            margin-bottom: 20px;
          }
          .email-content {
            text-align: justify;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: #fff;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-content">
           
            <p>The following Audit Schedule has been updated, and the revised date has been shared for your reference.</p>
            <ul>
             <li>DepartMent/Vertical: ${auditSchedule?.entityName}</li>
              <li>Audit Date: ${dayjs(auditSchedule?.time).format(
                'DD-MM-YYYY [T] HH:mm',
              )}</li>
              <li>Auditors: ${auditSchedule?.auditor
                .map((auditor) => auditor?.username)
                .join(' , ')}</li>
              <li>Auditees: ${auditSchedule?.auditee
                .map((auditee) => auditee?.username)
                .join(' , ')}</li>
            </ul>
            
            <p>From,<br />
            ${activeUser?.firstname} ${activeUser?.lastname}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const icsContent = generateICS(auditSchedule);
  // console.log('icsContent',icsContent)
  const uniqueEmails = [...new Set(users)];
  // console.log("uniqueEmails",uniqueEmails,users)
  const msg = {
    to: user?.email,
    // to:user?.email,
    // to:'svijay@processridge.in',
    cc: uniqueEmails,
    from: process.env.FROM,
    subject: `Audit schedule Date  has been Changed`,
    html: `<div>${emailMessage}</div>`,
    attachments: [
      {
        content: Buffer.from(icsContent).toString('base64'),
        filename: 'audit-schedule.ics',
        type: 'text/calendar',
        disposition: 'attachment',
      },
    ],
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `Audit schedule Date  has been Changed`,
        emailMessageIP,
        {
          filename: 'audit-schedule.ics',
          content: icsContent, // Directly use the content as plain text
          encoding: 'utf-8', // Use 'utf-8' encoding for plain text
          contentType: 'text/calendar', // Set correct MIME type for iCalendar
        },
        [],
        uniqueEmails,
      );
    } else {
      try {
        const finalResult = await sgMail.send(msg);
        // console.log("finalResult",finalResult)
      } catch (error) {
        // console.log('eerrr',error)
        throw error;
      }
    }
    //////console.log('mail sent in review');
  } catch (error) {
    if (error.response && error.response.body && error.response.body.errors) {
      return {
        error: error,
      };
      // Log or handle specific errors from SendGrid
      // console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      // console.error('An error occurred:', error.message);
    }
  }
};

export const sendMailForDeleteAuditSchedule = async (
  [user, ...users],
  auditSchedule,
  activeUser,
  mailService,
) => {
  const emailMessageIP = `
  The following Audit Schedule has been deleted.

  DepartMent/Vertical: ${auditSchedule?.entityName}
  Audit Date: ${
    auditSchedule?.time
      ? moment(auditSchedule?.time).format('DD-MM-YYYY HH:mm')
      : ''
  }
  
  Auditors: ${auditSchedule?.auditor
    ?.map((auditor) => auditor?.username)
    .join(' , ')}
  Auditees: ${auditSchedule?.auditee
    ?.map((auditee) => auditee?.username)
    .join(' , ')}

  From,
  ${activeUser.firstname} ${activeUser.lastname}
`;

  const emailMessage = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Audit Schedule Deleted</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
          }
          .email-container {
            margin: 0 auto;
            padding: 20px;
            max-width: 600px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          }
          .email-container h1 {
            text-align: center;
            margin-bottom: 20px;
          }
          .email-content {
            text-align: justify;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-content">
            <p>The following Audit Schedule has been <strong>deleted</strong>.</p>
            <ul>
              <li>DepartMent/Vertical: ${auditSchedule?.entityName}</li>
              <li>Audit Date: ${
                auditSchedule?.time
                  ? moment(auditSchedule?.time).format('DD-MM-YYYY HH:mm')
                  : ''
              }li>
              <li>Auditors: ${auditSchedule?.auditor
                ?.map((auditor) => auditor?.username)
                .join(' , ')}</li>
              <li>Auditees: ${auditSchedule?.auditee
                ?.map((auditee) => auditee?.username)
                .join(' , ')}</li>
            </ul>
            <p>From,<br />
            ${activeUser?.firstname} ${activeUser?.lastname}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const uniqueEmails = [...new Set(users)];

  const msg = {
    to: user?.email,
    cc: uniqueEmails,
    from: process.env.FROM,
    subject: `Audit schedule has been Deleted`,
    html: `<div>${emailMessage}</div>`,
  };

  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `Audit schedule has been Deleted`,
        emailMessageIP,
        null,
        [],
        uniqueEmails,
      );
    } else {
      try {
        const finalResult = await sgMail.send(msg);
      } catch (error) {
        throw error;
      }
    }
  } catch (error) {
    if (error.response?.body?.errors) {
      return {
        error,
      };
    }
  }
};

const generateICS = (auditSchedule) => {
  // Helper to format date in ICS-compliant UTC format
  // console.log("auditSchedule",auditSchedule)
  const formatDateForICS = (dateInput) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateInput}`);
    }
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}00Z`; // ICS format: YYYYMMDDTHHMMSSZ
  };

  if (!auditSchedule.time) {
    throw new Error(`Missing time in auditSchedule`);
  }

  const startDate = new Date(auditSchedule.time);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1-hour duration
  const startDateICS = formatDateForICS(startDate);
  const endDateICS = formatDateForICS(endDate);

  // ICS Timezone block for Asia/Kolkata (static offset as IST doesn't use DST)
  const icsTimeZone = `
BEGIN:VTIMEZONE
TZID:Asia/Kolkata
BEGIN:STANDARD
DTSTART:19971026T000000
TZOFFSETFROM:+0530
TZOFFSETTO:+0530
TZNAME:IST
END:STANDARD
END:VTIMEZONE`;

  return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//NONSGML v1.0//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:${auditSchedule._id}@yourdomain.com
DTSTAMP:${startDateICS}
DTSTART;TZID=Asia/Kolkata:${startDateICS}
DTEND;TZID=Asia/Kolkata:${endDateICS}
SUMMARY:Audit: ${auditSchedule.auditScheduleName}
DESCRIPTION:Audit Type: ${auditSchedule.auditType}
LOCATION:${process.env.REDIRECT}/audit/auditschedule/auditscheduleform/schedule/${auditSchedule._id}
END:VEVENT
END:VCALENDAR`.trim();
};

export const sendMailAuditSchedule = async () => {};

export const sendMailToHeadOnAuditReport = async (
  user,
  auditReport,

  activeUser,
  mailService,
) => {
  const emailMessageIP = `
            Hello, 
        
           Following Audit Report:${auditReport?.auditName} has been created and sent for your reference. 
          
  
           Click on the link to view "${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/auditplan/auditplanform/${auditReport?._id}" 
    From,
    ${activeUser.firstname} -${activeUser.lastname}
         
              `;
  const emailMessage = `
              <p>Hello,  </p>
              <p> Following Audit Report:${auditReport?.auditName} has been created and sent for your reference. </P
            
              
             <p> Click on the link to view</p>
           </p>
         "${process.env.PROTOCOL}://${activeUser?.organization?.realmName}.${process.env.REDIRECT}/audit/auditplan/auditplanform/${auditReport?._id}"
             <p>From,</p>
             <p>${activeUser?.firstname} -${activeUser?.lastname}</p>
        
              `;

  const msg = {
    to: user?.email, // attendee
    from: process.env.FROM, // MR
    subject: `Audit schedule for Audit Type ${auditReport?.auditName} has been published`,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `Audit schedule for Audit Type ${auditReport?.auditName} has been published`,
        emailMessageIP,
      );
      //console.log('sent mail');
    } else {
      try {
        const finalResult = await sgMail.send(msg);
        ////console.log('sent mail');
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
