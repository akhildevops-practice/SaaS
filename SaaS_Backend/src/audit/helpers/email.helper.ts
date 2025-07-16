/**
 *  This file defines all of the helper functions for sending email messages. Any changes to email text being sent can be
 *  chnaged here appropriately.
 */

import { InternalServerErrorException } from '@nestjs/common/exceptions';
import * as sgMail from '@sendgrid/mail';
import axios from 'axios';
sgMail.setApiKey(process.env.SMTP_PASSWORD);

export const sendNcRaisedEmail = async (
  result,
  nc,
  auditor,
  emailReceivers,
  mr,
  realmName,
  userTable,
  mailService,
) => {
  try {
    const pendingPromises = [];
    let emailMessage = ``;
    // console.log('inside send sometimes');
    for (const user of emailReceivers) {
      const userInDb = await userTable.findFirst({
        where: {
          id: user,
        },
      });
      // console.log('auditors', nc.auditors);
      // console.log('auditees', nc.auditees);
      const auditorPromises = nc.auditors.map(async (userId) => {
        const details = await userTable.findFirst({
          where: {
            id: userId,
          },
          select: {
            username: true,
            email: true,
          },
        });

        return details.username;
      });

      const auditornames = await Promise.all(auditorPromises);
      const auditeePromises = nc.auditees.map(async (userId) => {
        const details = await userTable.findFirst({
          where: {
            id: userId,
          },
          select: {
            username: true,
            email: true,
          },
        });

        return details.username;
      });
      // console.log('auditors', auditor);
      const auditeenames = await Promise.all(auditeePromises);
      const [auditorNames, auditeeNames] = await Promise.all([
        Promise.all(auditorPromises),
        Promise.all(auditeePromises),
      ]);

      const formattedAuditorNames = auditorNames.join(', ');
      const formattedAuditeeNames = auditeeNames.join(', ');
      const date = new Date(result.date).toLocaleString();
      // email message to sent
      emailMessage = `<!DOCTYPE html>
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
              <h1>New Nonconformity Raised</h1>
              <div class="email-content">
                <p>Dear ${userInDb?.firstname},</p>
                <p>We would like to inform you that a new nonconformity has been raised with the following details:</p>
                <ul>
                <li>Audit Report Name:${result.auditName}</li>
              
                  <li>NC Number: ${nc?.id}</li>
                  <li>NC Description: ${nc?.description}</li>
                  <li>Auditors:${formattedAuditorNames}</li>
                  <li>Auditees:${formattedAuditeeNames}</li>
                  <li>Date And Time:${date}</li>
               
                </ul>
                <p>Please click the button below to view the details and take necessary actions:</p>
                <a href="${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}/audit/nc/${nc._id}" target="_blank" class="button">View Nonconformity</a>
                <p>Best regards,</p>
                <p>${auditor.firstname} ${auditor.lastname}</p>
              </div>
            </div>
          </body>
        </html>
          `;

      const msg = {
        to: userInDb.email, // Change to your recipient
        from: process.env.FROM, // Change to your verified sender
        cc: mr,
        subject: 'New NC Raised',
        html: `<div>${emailMessage}</div>`,
      };
      const emailMessageIP = `
      Dear ${userInDb.firstname},
      We would like to inform you that a new Finding has been raised with the following details:

      Audit Report Name:${result.auditName}
      
      NC Number: ${nc.id}
      NC Description: ${nc.description}
     
      Auditors:${formattedAuditorNames}
      Auditees:${formattedAuditeeNames}
      Date And Time:${date}
      Please click the button below to view the details and take necessary actions:
    "${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/nc/${nc._id}"
      Best regards,
     ${auditor.firstname} ${auditor.lastname}
      `;
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await mailService(
          userInDb.email,
          `New ${nc.id}raised`,
          emailMessageIP,
        );
        // console.log('sent mnc raised mail');
      } else {
        pendingPromises.push(
          sgMail.send(msg).catch((err) => {
            // console.error(`Failed to send email to ${userInDb.email}:`, err);
            if (err.response && err.response.body && err.response.body.errors) {
              // console.error(
              //   'SendGrid error details:',
              //   err.response.body.errors,
              // );
            }
          }),
        );

        // const finalResult = await sgMail.send(msg);
      }
      // console.log('mail sending', msg);
      await Promise.all(pendingPromises);
      return 'Mail sent';
    }
  } catch (error) {
    // console.log('error', error);
  }
};

export const sendNcAcceptedEmail = async (
  nc,
  auditee,
  emailReceivers,
  mr,
  realmName,

  userTable,
  mailService,
) => {
  const pendingPromises = [];
  let emailMessage = ``;

  for (const user of emailReceivers) {
    const userInDb = await userTable.findFirst({
      where: {
        id: user,
      },
    });

    // email message to sent
    emailMessage = `
              <p> Dear, ${userInDb.firstname} </p>
  
              <p> ${auditee.firstname} ${auditee.lastname} has Sent to Auditor ${nc.id}. </p>
              <p>Here is the link ${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}/audit/nc/${nc._id}" target="_blank"> click here </a> </p>
  
              <p>Regards </p>
              <p> ${auditee.firstname} ${auditee.lastname} </p>
          `;

    const emailMessageIP = `
      Dear ${userInDb.firstname},
      
      ${auditee.firstname} ${auditee.lastname} has Sent to Auditor the NC ${nc.id}.
      
      Please click on the link below to view the NC:
      ${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/nc/${nc._id}
      
      Regards,
      ${auditee.firstname} ${auditee.lastname}
      `;

    const msg = {
      to: userInDb.email, // Change to your recipient
      from: process.env.FROM, // Change to your verified sender
      cc: mr,
      subject: `${nc.id} Sent to Auditor`,
      html: `<div>${emailMessage}</div>`,
    };
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `${nc.id} has been Accepted`,
        '',
        emailMessageIP,
      );
    } else {
      pendingPromises.push(
        sgMail.send(msg).catch((err) => {
          // console.error(`Failed to send email to ${userInDb.email}:`, err);
          if (err.response && err.response.body && err.response.body.errors) {
            // console.error('SendGrid error details:', err.response.body.errors);
          }
        }),
      );
    }
  }

  return await Promise.all(pendingPromises);
};

export const sendNcRejectedEmail = async (
  nc,
  auditee,
  emailReceivers,
  realmName,

  userTable,
  mailService,
) => {
  const pendingPromises = [];
  let emailMessage = ``;

  for (const user of emailReceivers) {
    const userInDb = await userTable.findFirst({
      where: {
        id: user,
      },
    });

    // email message to sent
    emailMessage = `
              <p> Dear, ${userInDb.firstname} </p>
  
              <p> ${auditee.firstname} ${auditee.lastname} has not accepted the NC ${nc.id}. </p>
              <p> You can accept / reject the NC. </p>
              <p>Here is the link <a href="${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}/audit/nc/${nc._id}" target="_blank"> click here </a> </p>
  
              <p>Regards </p>
              <p> ${auditee.firstname} ${auditee.lastname} </p>
          `;
    let emailMessageIP = `
           Dear, ${userInDb.firstname} 

           ${auditee.firstname} ${auditee.lastname} has not accepted the NC ${nc.id}.
          You can accept / reject the NC.
          Here is the link ${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/nc/${nc._id}"

          Regards
          ${auditee.firstname} ${auditee.lastname} 
      `;

    const msg = {
      to: userInDb.email, // Change to your recipient
      from: process.env.FROM, // Change to your verified sender
      subject: `${nc.id} has ben Rejected`,
      html: `<div>${emailMessage}</div>`,
    };
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `${nc.id} has been Rejected`,
        emailMessageIP,
      );
    } else {
      pendingPromises.push(
        sgMail.send(msg).catch((err) => {
          // console.error(`Failed to send email to ${userInDb.email}:`, err);
          if (err.response && err.response.body && err.response.body.errors) {
            // console.error('SendGrid error details:', err.response.body.errors);
          }
        }),
      );
    }
  }

  return await Promise.all(pendingPromises);
};

export const sendNcClosureEmail = async (
  nc,
  mr,
  emailReceivers,
  realmName,

  userTable,
  mailService,
) => {
  const pendingPromises = [];
  let emailMessage = ``;

  for (const user of emailReceivers) {
    const userInDb = await userTable.findFirst({
      where: {
        id: user,
      },
    });

    // email message to sent
    emailMessage = `
              <p> Dear All, </p>
  
              <p> MR has closed the following NC ${nc.id}. </p>
              <p>Here is the link <a href="${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}/audit/nc/${nc._id}" target="_blank"> click here </a> </p>
  
              <p>Regards </p>
              <p> ${mr.firstname} ${mr.lastname} </p>
          `;
    let emailMessageIP = (emailMessage = `
       Dear All, 

        MR has closed the following NC ${nc.id}. 
       Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/nc/${nc._id}" 

      Regards 
      ${mr.firstname} ${mr.lastname}
   `);

    const msg = {
      to: userInDb.email, // Change to your recipient
      from: process.env.FROM, // Change to your verified sender
      subject: `${nc.id} has been Closed`,
      html: `<div>${emailMessage}</div>`,
    };
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `${nc.id} has been Closed`,
        emailMessageIP,
      );
    } else {
      pendingPromises.push(
        sgMail.send(msg).catch((err) => {
          // console.error(`Failed to send email to ${userInDb.email}:`, err);
          if (err.response && err.response.body && err.response.body.errors) {
            // console.error('SendGrid error details:', err.response.body.errors);
          }
        }),
      );
    }
  }

  return await Promise.all(pendingPromises);
};

export const sendMrNcAcceptanceEmail = async (
  nc,
  mr,
  emailReceivers,
  cc,
  realmName,

  userTable,
  mailService,
) => {
  const pendingPromises = [];
  let emailMessage = ``;
  for (const user of emailReceivers) {
    const userInDb = await userTable.findFirst({
      where: {
        id: user,
      },
    });

    // email message to sent
    emailMessage = `
              <p> Dear ${userInDb.firstname}, </p>
  
              <p> MR has accepted the following NC ${nc.id}. </p>
              <p>Here is the link <a href="${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}/audit/nc/${nc._id}" target="_blank"> click here </a> </p>
  
              <p>Regards </p>
              <p> ${mr.firstname} ${mr.lastname} </p>
          `;
    let emailMessageIP = `
          Dear ${userInDb.firstname},

         MR has accepted the following NC ${nc.id}.
        Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/nc/${nc._id}" 

          <p>Regards </p>
          <p> ${mr.firstname} ${mr.lastname} </p>
      `;

    const msg = {
      to: userInDb.email, // auditee
      from: process.env.FROM, // MR
      cc: cc,
      subject: `${nc.id} has ben Accepted`,
      html: `<div>${emailMessage}</div>`,
    };
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `${nc.id} has been Accepted`,
        emailMessageIP,
      );
    } else {
      pendingPromises.push(
        sgMail.send(msg).catch((err) => {
          // console.error(`Failed to send email to ${userInDb.email}:`, err);
          if (err.response && err.response.body && err.response.body.errors) {
            // console.error('SendGrid error details:', err.response.body.errors);
          }
        }),
      );
    }
  }

  return await Promise.all(pendingPromises);
};

function formatDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export const sendFindingAcceptanceEmail = async (
  ncDepartMent,
  audit,
  nc,
  mr,
  emailReceivers,
  cc,
  realmName,
  userTable,
  mailService,
) => {
  const pendingPromises = [];
  let emailMessage = ``;

  let [user, ...restUsers] = emailReceivers;
  restUsers = restUsers?.map((value) => value?.email);
  cc = [...cc, ...restUsers];
  cc = [...new Set(cc)];
  // for (const user of emailReceivers) {
  // email message to sents
  emailMessage = `
   <div style="font-family: Arial, sans-serif; padding: 20px;">
    <p>Dear ${user.username},</p>
    <p>Following Finding has been Accepted by ${mr.username}</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Audit Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              audit?.auditName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Date of Audit</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(
              audit?.date,
            )}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Department Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              ncDepartMent?.entityName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Type</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.type}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Number</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.id}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Description</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;"></td>
        </tr>
    </table>

    <p><a href="${process.env.PROTOCOL}://${realmName}.${
    process.env.REDIRECT
  }/audit/nc/${
    nc._id
  }" target="_blank" style="color: #1a73e8; text-decoration: none;">Click here for more details</a></p>
    Here is the link ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}
</div>
          `;

  const emailMessageIp = `
          Dear ${user.username},
          
          Following Finding has been Accepted by ${mr.username}.
          
          Audit Name: ${audit?.auditName}
          Date of Audit: ${formatDate(audit?.date)}
          Department Name: ${ncDepartMent?.entityName}
          Finding Type: ${nc?.type}
          Finding Number: ${nc?.id}
          Finding Description: 
          
          Click here for more details: ${process.env.PROTOCOL}://${realmName}.${
    process.env.REDIRECT
  }/audit/nc/${nc._id}
          
          Here is the link: ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}
          `;

  const msg = {
    to: user?.email, // auditee
    from: process.env.FROM, // MR
    cc: cc,
    subject: `${nc.id} has ben Accepted`,
    html: `<div>${emailMessage}</div>`,
  };
  if (process.env.MAIL_SYSTEM === 'IP_BASED') {
    const result = await mailService(
      user.email,
      `${nc.id} has ben Accepted`,
      `${nc.id} has been Accepted`,
      emailMessageIp,
    );
  } else {
    pendingPromises.push(
      sgMail.send(msg).catch((err) => {
        // console.error(`Failed to send email to ${user.email}:`, err);
        if (err.response && err.response.body && err.response.body.errors) {
          // console.error('SendGrid error details:', err.response.body.errors);
        }
      }),
    );
  }
  // }

  return await Promise.all(pendingPromises);
};

export const sendFindingRejectEmail = async (
  ncDepartMent,
  audit,
  nc,
  mr,
  emailReceivers,
  cc,
  realmName,
  userTable,
  mailService,
) => {
  const pendingPromises = [];
  let emailMessage = ``;

  // for (const user of emailReceivers) {
  // email message to sents
  let [user, ...restusers] = emailReceivers;

  const emails = restusers.map((value) => value.email);
  cc = [...cc, ...emails];
  cc = [...new Set(cc)];
  emailMessage = `
   <div style="font-family: Arial, sans-serif; padding: 20px;">
    <p>Dear ${user.username},</p>
    <p>Following Finding has been Rejected by ${mr.username}</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Audit Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              audit?.auditName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Date of Audit</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(
              audit?.date,
            )}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Department Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              ncDepartMent?.entityName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Type</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.type}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Number</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.id}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Description</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;"></td>
        </tr>
    </table>
    <p><a href="${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${
    nc._id
  }" target="_blank" style="color: #1a73e8; text-decoration: none;">Click here for more details</a></p>
    Here is the link ${process.env.PROTOCOL}://${realmName}.${
    process.env.REDIRECT
  }/audit/nc/${nc._id}"
</div>
          `;
  let emailMessageIP = `
          Dear ${user.username},

         Following Finding has been Rejected by ${mr.username}.
         Audit Name ${audit?.auditName}
         Date of Audit ${formatDate(audit?.date)}
         Department Name ${ncDepartMent?.entityName}
         Finding Type ${nc?.type}
         Finding Number ${nc?.id}
         
        Here is the link "${process.env.PROTOCOL}://${
    process.env.REDIRECT
  }/audit/nc/${nc._id}" 

          <p>Regards </p>
          <p> ${mr.firstname} ${mr.lastname} </p>
      `;
  const msg = {
    to: user?.email, // auditee
    from: process.env.FROM, // MR
    cc: cc,
    subject: `${nc.id} has ben Rejected`,
    html: `<div>${emailMessage}</div>`,
  };
  if (process.env.MAIL_SYSTEM === 'IP_BASED') {
    const result = await mailService(
      user.email,
      `${nc.id} has been Rejected`,
      emailMessageIP,
    );
  } else {
    // console.log('final mail initiager', msg);
    pendingPromises.push(
      sgMail.send(msg).catch((err) => {
        // console.error(`Failed to send email to ${user.email}:`, err);
        if (err.response && err.response.body && err.response.body.errors) {
          // console.error('SendGrid error details:', err.response.body.errors);
        }
      }),
    );
  }
  // }

  return await Promise.all(pendingPromises);
};

export const sendFindingSentBackEmail = async (
  ncDepartMent,
  audit,
  nc,
  mr,
  emailReceivers,
  cc,
  realmName,
  userTable,
  rejectComment,
  mailService,
) => {
  const pendingPromises = [];
  let emailMessage = ``;

  // for (const user of emailReceivers) {
  // email message to sents
  let [user, ...restUsers] = emailReceivers;
  cc = cc.filter((value) => value !== user.email);
  const email = restUsers?.map((value) => value?.email);
  cc = [...cc, ...email];
  cc = [...new Set(cc)];
  emailMessage = `
   <div style="font-family: Arial, sans-serif; padding: 20px;">
    <p>Dear ${user.username},</p>
    <p>Following Finding has been Sent Back To Auditee by ${mr.username}</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Audit Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              audit?.auditName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Date of Audit</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(
              audit?.date,
            )}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Department Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              ncDepartMent?.entityName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Type</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.type}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Number</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.id}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Reject Comment</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${rejectComment}</td>
        </tr>
    </table>

    <p><a href="${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${
    nc._id
  }" target="_blank" style="color: #1a73e8; text-decoration: none;">Click here for more details</a></p>
    Here is the link ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}"
</div>
          `;

  let emailMessageIp = `
          Dear ${user.username},
          
          Following Finding has been Sent Back To Auditee by ${mr.username}.
          
          Audit Name: ${audit?.auditName}
          Date of Audit: ${formatDate(audit?.date)}
          Department Name: ${ncDepartMent?.entityName}
          Finding Type: ${nc?.type}
          Finding Number: ${nc?.id}
          Reject Comment: ${rejectComment}
          
          Click here for more details: ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}
          
          Here is the link: ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}
          `;

  const msg = {
    to: user?.email, // auditee
    from: process.env.FROM, // MR
    cc: cc,
    subject: `${nc.id} has ben Sent Back to Auditee`,
    html: `<div>${emailMessage}</div>`,
  };
  if (process.env.MAIL_SYSTEM === 'IP_BASED') {
    const result = await mailService(
      user.email,
      `${nc.id} has been Sent Back to Auditee`,
      emailMessageIp,
    );
  } else {
    pendingPromises.push(
      sgMail.send(msg).catch((err) => {
        // console.error(`Failed to send email to ${user.email}:`, err);
        if (err.response && err.response.body && err.response.body.errors) {
          // console.error('SendGrid error details:', err.response.body.errors);
        }
      }),
    );
  }
  // }

  return await Promise.all(pendingPromises);
};

export const sendFindingVerifiedEmail = async (
  ncDepartMent,
  audit,
  nc,
  mr,
  emailReceivers,
  cc,
  realmName,
  userTable,
  mailService,
) => {
  const pendingPromises = [];
  let emailMessage = ``;

  // for (const user of emailReceivers) {
  // email message to sents
  let [user, ...restEmail] = emailReceivers;
  let email = restEmail?.map((value) => value?.email);
  cc = cc.filter((value) => value !== user.email);
  cc = [...cc, ...email];
  cc = [...new Set(cc)];
  emailMessage = `
   <div style="font-family: Arial, sans-serif; padding: 20px;">
    <p>Dear ${user.username},</p>
    <p>Following Finding has been Verified by ${mr.username}</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Audit Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              audit?.auditName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Date of Audit</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(
              audit?.date,
            )}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Department Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              ncDepartMent?.entityName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Type</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.type}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Number</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.id}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Reject Comment</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${''}</td>
        </tr>
    </table>

    <p><a href="${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${
    nc._id
  }" target="_blank" style="color: #1a73e8; text-decoration: none;">Click here for more details</a></p>
    Here is the link ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }.${process.env.REDIRECT}/audit/nc/${nc._id}"
</div>
          `;

  const emailMessageIp = `
          Dear ${user.username},
          
          Following Finding has been Verified by ${mr.username}.
          
          Audit Name: ${audit?.auditName}
          Date of Audit: ${formatDate(audit?.date)}
          Department Name: ${ncDepartMent?.entityName}
          Finding Type: ${nc?.type}
          Finding Number: ${nc?.id}
          Reject Comment: 
          
          Click here for more details: ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}
          
          Here is the link: ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}
          `;

  const msg = {
    to: user?.email, // auditee
    from: process.env.FROM, // MR
    cc: cc,
    subject: `${nc.id} has been Verified By Auditor`,
    html: `<div>${emailMessage}</div>`,
  };
  if (process.env.MAIL_SYSTEM === 'IP_BASED') {
    const result = await mailService(
      user.email,
      `${nc.id} has been Verified By Auditor`,
      emailMessageIp,
    );
  } else {
    pendingPromises.push(
      sgMail.send(msg).catch((err) => {
        // console.error(`Failed to send email to ${user.email}:`, err);
        if (err.response && err.response.body && err.response.body.errors) {
          // console.error('SendGrid error details:', err.response.body.errors);
        }
      }),
    );
  }
  // }

  return await Promise.all(pendingPromises);
};

export const sendFindingClosureEmail = async (
  ncDepartMent,
  audit,
  nc,
  mr,
  emailReceivers,
  cc,
  realmName,
  userTable,
  mailService,
) => {
  const pendingPromises = [];
  let emailMessage = ``;

  // for (const user of emailReceivers) {
  // email message to sents
  let [user, ...restUser] = emailReceivers;
  let email = restUser?.map((value) => value?.email);
  cc = [...cc, ...email];
  cc = [...new Set(cc)];
  cc = cc.filter((value) => value !== user.email);
  emailMessage = `
   <div style="font-family: Arial, sans-serif; padding: 20px;">
    <p>Dear ${user.username},</p>
    <p>Following Finding has been Closure by ${mr.username}</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Audit Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              audit?.auditName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Date of Audit</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(
              audit?.date,
            )}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Department Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${
              ncDepartMent?.entityName
            }</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Type</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.type}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Finding Number</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${nc?.id}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Reject Comment</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${''}</td>
        </tr>
    </table>

    <p><a href="${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${
    nc._id
  }" target="_blank" style="color: #1a73e8; text-decoration: none;">Click here for more details</a></p>
    Here is the link ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}"
</div>
          `;

  const emailMessageIp = `
Dear ${user.username},

Following Finding has been Closed by ${mr.username}.

Audit Name: ${audit?.auditName}
Date of Audit: ${formatDate(audit?.date)}
Department Name: ${ncDepartMent?.entityName}
Finding Type: ${nc?.type}
Finding Number: ${nc?.id}
Reject Comment: 

Click here for more details: ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}

Here is the link: ${process.env.PROTOCOL}://${
    process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
  }${process.env.REDIRECT}/audit/nc/${nc._id}
`;

  const msg = {
    to: user?.email, // auditee
    from: process.env.FROM, // MR
    cc: cc,
    subject: `${nc.id} has been Closed`,
    html: `<div>${emailMessage}</div>`,
  };
  if (process.env.MAIL_SYSTEM === 'IP_BASED') {
    const result = await mailService(
      user.email,
      `${nc.id} has been Closed`,
      '',
      emailMessageIp,
    );
  } else {
    pendingPromises.push(
      sgMail.send(msg).catch((err) => {
        // console.error(`Failed to send email to ${user.email}:`, err);
        if (err.response && err.response.body && err.response.body.errors) {
          // console.error('SendGrid error details:', err.response.body.errors);
        }
      }),
    );
  }
  // }

  return await Promise.all(pendingPromises);
};

export const sendAuditorNcAcceptanceEmail = async (
  nc,
  auditor,
  emailReceivers,
  realmName,

  userTable,
  mailService,
) => {
  // email to MR, Auditee on CC
  const pendingPromises = [];
  let emailMessage = ``;

  for (const user of emailReceivers) {
    const userInDb = await userTable.findFirst({
      where: {
        id: user,
      },
    });

    // email message to sent
    emailMessage = `
              <p> Dear ${userInDb.firstname}, </p>
  
              <p> Auditor has reviewed and accepted the following NC ${
                nc.id
              }. </p>
              <p>Here is the link <a href="${process.env.PROTOCOL}://${
      process.env.MAIL_SYSTEM === 'IP_BASED' ? '' : `${realmName}.`
    }.${process.env.REDIRECT}/audit/nc/${
      nc._id
    }" target="_blank"> click here </a> </p>
  
              <p>Regards </p>
              <p> ${auditor.firstname} ${auditor.lastname} </p>
          `;

    let emailMessageIP = `
              Dear ${userInDb.firstname}, 
  
              Auditor has reviewed and accepted the following NC ${nc.id}. 
              Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/nc/${nc._id}" 
  
              Regards 
              ${auditor.firstname} ${auditor.lastname}
          `;

    const msg = {
      to: userInDb.email, // auditee
      from: process.env.FROM, // MR
      subject: `${nc.id} Accepted`,
      html: `<div>${emailMessage}</div>`,
    };
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `${nc.id} has been Accepted`,
        emailMessageIP,
      );
    } else {
      pendingPromises.push(
        sgMail.send(msg).catch((err) => {
          // console.error(`Failed to send email to ${userInDb.email}:`, err);
          if (err.response && err.response.body && err.response.body.errors) {
            // console.error('SendGrid error details:', err.response.body.errors);
          }
        }),
      );
    }
  }

  return await Promise.all(pendingPromises);
};
export const sendDepartmentHeadEscalationEmail = async (
  nc,
  departmenthead,

  realmName,

  userTable,
  mailService,
) => {
  // email to MR, Auditee on CC
  const pendingPromises = [];
  let emailMessage = ``;

  const userInDb = await userTable.findFirst({
    where: {
      id: departmenthead,
    },
  });

  // email message to sent
  emailMessage = `
              <p> Dear ${userInDb.firstname}, </p>
  
              <p> The following NC ${nc}.  has not been closed past its maximum days for closure</p>
              <p>Here is the link <a href="${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}/audit/nc/${nc}" target="_blank"> click here </a> </p>
  
              <p>Regards </p>
          
          `;
  let emailMessageIP = `
         Dear ${userInDb.firstname},

          The following NC ${nc}.  has not been closed past its maximum days for closure
          Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/nc/${nc}" 

          Regards 
      
      `;

  const msg = {
    to: userInDb.email, // auditee
    from: process.env.FROM, // MR
    subject: 'NC not Closed past its due date',
    html: `<div>${emailMessage}</div>`,
  };
  if (process.env.MAIL_SYSTEM === 'IP_BASED') {
    const result = await mailService(
      userInDb.email,
      `${nc.id} not closed past its due date`,
      emailMessageIP,
    );
  } else {
    pendingPromises.push(
      sgMail.send(msg).catch((err) => {
        // console.error(`Failed to send email to ${userInDb.email}:`, err);
        if (err.response && err.response.body && err.response.body.errors) {
          // console.error('SendGrid error details:', err.response.body.errors);
        }
      }),
    );
  }

  return await Promise.all(pendingPromises);
};
export const sendMCOEEscalationEmail = async (
  nc,
  mcoe,

  realmName,

  userTable,
  mailService,
) => {
  // email to MR, Auditee on CC
  const pendingPromises = [];
  let emailMessage = ``;

  const userInDb = await userTable.findFirst({
    where: {
      id: mcoe,
    },
  });

  // email message to sent
  emailMessage = `
              <p> Dear ${userInDb.firstname}, </p>
  
              <p> The following NC ${nc.id}.  has not been closed past its maximum days for closure</p>
              <p>Here is the link <a href="${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}/audit/nc/${nc._id}" target="_blank"> click here </a> </p>
  
              <p>Regards </p>
          
          `;
  let emailMessageIP = `
          Dear ${userInDb.firstname}, 

          The following NC ${nc.id}.  has not been closed past its maximum days for closure
          Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/nc/${nc._id}"

          Regards
      
      `;

  const msg = {
    to: userInDb.email, // auditee
    from: process.env.FROM, // MR
    subject: 'NC not Closed past its due date',
    html: `<div>${emailMessage}</div>`,
  };
  if (process.env.MAIL_SYSTEM === 'IP_BASED') {
    const result = await mailService(
      userInDb.email,
      `${nc.id} not closed past its due date`,
      emailMessageIP,
    );
  } else {
    pendingPromises.push(
      sgMail.send(msg).catch((err) => {
        // console.error(`Failed to send email to ${userInDb.email}:`, err);
        if (err.response && err.response.body && err.response.body.errors) {
          // console.error('SendGrid error details:', err.response.body.errors);
        }
      }),
    );
  }
  //////////////console.log('mail sent');
  return await Promise.all(pendingPromises);
};
