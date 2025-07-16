import { HttpException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(
  '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',
);
export const sendMailForReview = async (
  user,
  userInfo,
  documentInfo,
  sendNM,
) => {
  if (
    documentInfo.title &&
    documentInfo.location &&
    user.name &&
    documentInfo.organization &&
    userInfo
  ) {
    const emailMessage = `
  <p> 
  Following CIP has been created and sent for review</p>
  <p>CIPName:${documentInfo.title}</p>
  <p>Unit:${documentInfo.location?.name}</p>
  <p>Createdby:${user.name}</p>
  <p>Link:${process.env.PROTOCOL}://${documentInfo.organization?.realmName}.${process.env.REDIRECT}/cip/management
  </p>
  `;
    const emailMessageIP = `
  
  Following CIP has been created and sent for review
  CIPName:${documentInfo.title}
  <p>Unit:${documentInfo.location.name}</p>
  <p>Createdby:${user.name}</p>
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/cip/management" 
  `;

    const msg = {
      to: userInfo.email, // Change to your recipient
      from: process.env.REPLY_TO, // Change to your verified sender
      subject: `${documentInfo.title} has been sent for review`,
      html: `<div>${emailMessage}</div>`,
    };
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await sendNM(
          userInfo.email,
          `${documentInfo.title} has been sent for review`,
          emailMessageIP,
        );
      } else {
        try {
          const finalResult = await sgMail.send(msg);
        } catch (error) {
          throw error;
        }
      }

      //////console.log('mail sent in review');
    } catch (error) {
      if (error.response && error.response.body && error.response.body.errors) {
        // Log or handle specific errors from SendGrid
        console.error('SendGrid Error:', error.response.body.errors);
      } else {
        // Handle other types of errors
        // console.error('An error occurred:', error.message);
      }
    }
  }
};
export const sendMailForEdit = async (
  user,
  userInfo,
  documentInfo,
  comment,
  sendNM,
) => {
  if (
    documentInfo.title &&
    documentInfo.location &&
    user.name &&
    documentInfo.organization &&
    userInfo
  ) {
    //console.log('sending the send for edit mail');
    const emailMessage = `
  <p> 
  Following CIP has been reviewed and sent back for edit</p>
  <p>DocumentName:${documentInfo.title}</p>
  <p>Unit:${documentInfo.location.name}</p>
  <p>Created by:${user.name}</p>
  <p>Link:${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/cip/management
  </p>
    `;
    const emailMessageIP = `
  Following CIP has been reviewed and sent back for edit
  DocumentName:${documentInfo.title}
  Unit:${documentInfo.location.name}
  Created By:${user.name}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/cip/management" 
    `;
    const msg = {
      to: userInfo.email, // Change to your recipient
      from: process.env.REPLY_TO, // Change to your verified sender
      subject: `${documentInfo.title} has been reviewed and sent back for edit`,
      html: `<div>${emailMessage}</div>`,
    };
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await sendNM(
          userInfo.email,
          `${documentInfo.title} has been reviewed and sent back for edit`,
          emailMessageIP,
        );
        ////console.log('sent mail');
      } else {
        const finalResult = await sgMail.send(msg);
        //console.log('mail sent', finalResult);
      }
    } catch (error) {
      ////////console.log('error mail not sent');
    }
  }
};
export const sendMailForApproval = async (
  user,
  userInfo,
  documentInfo,
  sendNM,
) => {
  if (
    documentInfo.title &&
    documentInfo.location &&
    user.name &&
    documentInfo.organization &&
    userInfo
  ) {
    // //console.log('sending the mail');

    const emailMessage = `
  <p> 
  Following CIP has been reviewed and sent for approval</p>
  <p>DocumentName:${documentInfo.title}</p>
  <p>Unit:${documentInfo.location.name}</p>
  <p>Created by:${user.name}</p>
  <p>Link:${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/cip/management
  </p>
  `;
    const emailMessageIP = `
  Following CIP has been reviewed and sent for approval
  DocumentName:${documentInfo.title}
  Unit:${documentInfo.location.name}
  Created By:${user.name}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/cip/management" 
  `;
    const msg = {
      to: userInfo.email, // Change to your recipient
      from: process.env.REPLY_TO, // Change to your verified sender
      subject: `${documentInfo.title} has been reviewed and sent for approval`,
      html: `<div>${emailMessage}</div>`,
    };
    //////////console.log('msg', msg);
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await sendNM(
          userInfo.email,
          `${documentInfo.title} has been reviewed and sent for approval`,
          emailMessageIP,
        );
        // //console.log('sent mail');
      } else {
        const finalResult = await sgMail.send(msg);
      }
    } catch (error) {
      ////////console.log('error mail not sent', error);
    }
  }
};
export const sendMailPublished = async (userInfo, documentInfo, sendNM) => {
  if (
    documentInfo.title &&
    documentInfo.location &&
    documentInfo.organization &&
    userInfo
  ) {
    // //console.log('sending the published mail', documentInfo);
    const emailMessage = `
  <p> 
  Following CIP has been approved and distributed</p>
  <p>Name:${documentInfo.title}</p>
  <p>Unit:${documentInfo.location.name}</p>
  <p>Link:${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/cip/management
  </p>
  `;
    const emailMessageIP = `
  Following CIP has been approved and distributed
  Name:${documentInfo.title}
  Unit:${documentInfo.location.name}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/cip/management" 
  `;
    const msg = {
      to: userInfo.email, // Change to your recipient
      from: process.env.REPLY_TO, // Change to your verified sender
      subject: `${documentInfo.title} has been approved and distributed for reference`,
      html: `<div>${emailMessage}</div>`,
    };
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        try {
          const result = await sendNM(
            userInfo.email,
            `${documentInfo.title} has been approved and distributed for reference`,
            emailMessageIP,
          );
          // //console.log('sent mail');
        } catch (error) {
          throw error;
        }
      } else {
        try {
          const finalResult = await sgMail.send(msg);
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      ////////console.log('error');
    }
  }
};
export const sendRevisionReminderMail = async (
  userInfo,
  documentInfo,
  sendNM,
) => {
  //////////////console.log("sending the mail",userInfo,documentInfo)
  const emailMessage = `
  <p> Following document ${documentInfo.documentName} is due for revision. </p>
  <p>Number:${documentInfo.documentNumbering}</p>
  <p>Name:${documentInfo.documentName}</p>
  <p>DocumentType:${documentInfo.docType}</p>
  <p>Name:${documentInfo.documentName}</p>
  <p>Unit:${documentInfo.creatorLocation.locationName}</p>
  <p>Department:${documentInfo.creatorEntity.entityName}</p>
  <p>Published by:${userInfo.firstname}${userInfo.lastname}</p>
  <p>Link:<a href="${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}" target="_blank">${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}</a>
  </p>
  `;
  const emailMessageIP = `  
  Following document ${documentInfo.documentName} is due for revision. 
  Number:${documentInfo.documentNumbering}
  Name:${documentInfo.documentName}
  DocumentType:${documentInfo.docType}
  Unit:${documentInfo.creatorLocation.locationName}
  Department:${documentInfo.creatorEntity.entityName}
  Published By:${userInfo.firstname}${userInfo.lastname}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}"`;
  const msg = {
    to: userInfo.email, // Change to your recipient
    from: process.env.FROM, // Change to your verified sender
    subject: `${documentInfo.documentName} is due for revision`,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await sendNM(
        userInfo.email,
        `${documentInfo.documentName} is due for revision`,
        emailMessageIP,
      );

      // //console.log('sent mail');
    } else {
      const finalResult = await sgMail.send(msg);
      if (finalResult) {
        // //console.log('mail sent');
      }
    }
  } catch (error) {
    ////////////////console.log('error');
  }
};

export const sendMailForComplete = async (
  user,
  userInfo,
  documentInfo,
  sendNM,
) => {
  if (
    documentInfo.title &&
    documentInfo.location &&
    user.name &&
    documentInfo.organization &&
    userInfo
  ) {
    const emailMessage = `
  <p> 
  Following CIP has been Completed</p>
  <p>CIPName:${documentInfo.title}</p>
  <p>Unit:${documentInfo.location.name}</p>
  <p>Createdby:${user.name}</p>
  <p>Link:${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/cip/management
  </p>
  `;
    const emailMessageIP = `
  
  Following CIP has been Completed
  CIPName:${documentInfo.title}
  <p>Unit:${documentInfo.location.name}</p>
  <p>Createdby:${user.name}</p>
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/cip/management" 
  `;

    const msg = {
      to: userInfo.email, // Change to your recipient
      from: process.env.REPLY_TO, // Change to your verified sender
      subject: `${documentInfo.title} has been Completed`,
      html: `<div>${emailMessage}</div>`,
    };
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await sendNM(
          userInfo.email,
          `${documentInfo.title} has been Completed`,
          emailMessageIP,
        );
      } else {
        try {
          const finalResult = await sgMail.send(msg);
        } catch (error) {
          throw error;
        }
      }
      //////console.log('mail sent in review');
    } catch (error) {
      if (error.response && error.response.body && error.response.body.errors) {
        // Log or handle specific errors from SendGrid
        console.error('SendGrid Error:', error.response.body.errors);
      } else {
        // Handle other types of errors
        // console.error('An error occurred:', error.message);
      }
    }
  }
};

export const sendMailForVerification = async (
  user,
  userInfo,
  documentInfo,
  sendNM,
) => {
  if (
    documentInfo.title &&
    documentInfo.location &&
    user.name &&
    documentInfo.organization &&
    userInfo
  ) {
    const emailMessage = `
  <p> 
  Following CIP has been Completed and sent for Verification</p>
  <p>CIPName:${documentInfo.title}</p>
  <p>Unit:${documentInfo.location.name}</p>
  <p>Createdby:${user.name}</p>
  <p>Link:${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/cip/management
  </p>
  `;
    const emailMessageIP = `
  
  Following CIP has been Completed and sent for Verification
  CIPName:${documentInfo.title}
  <p>Unit:${documentInfo.location.name}</p>
  <p>Createdby:${user.name}</p>
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/cip/management" 
  `;

    const msg = {
      to: userInfo.email, // Change to your recipient
      from: process.env.REPLY_TO, // Change to your verified sender
      subject: `${documentInfo.title} has been sent for Verification`,
      html: `<div>${emailMessage}</div>`,
    };
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await sendNM(
          userInfo.email,
          `${documentInfo.title} has been sent for Verification`,
          emailMessageIP,
        );
      } else {
        try {
          const finalResult = await sgMail.send(msg);
        } catch (error) {
          throw error;
        }
      }
      //////console.log('mail sent in review');
    } catch (error) {
      if (error.response && error.response.body && error.response.body.errors) {
        // Log or handle specific errors from SendGrid
        console.error('SendGrid Error:', error.response.body.errors);
      } else {
        // Handle other types of errors
        // console.error('An error occurred:', error.message);
      }
    }
  }
};

export const sendMailForClosed = async (
  user,
  userInfo,
  documentInfo,
  sendNM,
) => {
  if (
    documentInfo.title &&
    documentInfo.location &&
    user.name &&
    documentInfo.organization &&
    userInfo
  ) {
    const emailMessage = `
  <p> 
  Following CIP has been verified and closed</p>
  <p>CIPName:${documentInfo.title}</p>
  <p>Unit:${documentInfo.location.name}</p>
  <p>Createdby:${user.name}</p>
  <p>Link:${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/cip/management
  </p>
  `;
    const emailMessageIP = `
  
  Following CIP has been verified and closed
  CIPName:${documentInfo.title}
  <p>Unit:${documentInfo.location.name}</p>
  <p>Createdby:${user.name}</p>
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/cip/management" 
  `;

    const msg = {
      to: userInfo.email, // Change to your recipient
      from: process.env.REPLY_TO, // Change to your verified sender
      subject: `${documentInfo.title} has been closed`,
      html: `<div>${emailMessage}</div>`,
    };
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await sendNM(
          userInfo.email,
          `${documentInfo.title} has been closed`,
          emailMessageIP,
        );
      } else {
        try {
          const finalResult = await sgMail.send(msg);
        } catch (error) {
          throw error;
        }
      }
      //////console.log('mail sent in review');
    } catch (error) {
      if (error.response && error.response.body && error.response.body.errors) {
        // Log or handle specific errors from SendGrid
        console.error('SendGrid Error:', error.response.body.errors);
      } else {
        // Handle other types of errors
        // console.error('An error occurred:', error.message);
      }
    }
  }
};
