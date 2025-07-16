import { HttpException } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { emailMessageTemplate } from 'src/utils/emailMessages/emailMessages';
import { EmailService } from 'src/email/email.service';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { doc } from 'prettier';

sgMail.setApiKey(process.env.SMTP_PASSWORD);
export const generateNumbering = (prefixArr, locationId, entityId, year) => {
  const perefixNumberingArr = [];
  const currentTime = new Date();
  prefixArr.forEach((item) => {
    if (item === 'YY') {
      // const year = currentTime.getFullYear();
      perefixNumberingArr.push(year);
    } else if (item == 'MM') {
      const month = (currentTime.getMonth() + 1).toLocaleString('en-US', {
        minimumIntegerDigits: 2,
      });
      perefixNumberingArr.push(month);
    } else if (item == 'LocationId') {
      perefixNumberingArr.push(locationId);
    } else if (item == 'DepartmentId') {
      perefixNumberingArr.push(entityId);
    } else {
      perefixNumberingArr.push(item);
    }
  });

  return perefixNumberingArr;
};

export const prefixAndSuffix = async (
  prefixTable,
  locationId,
  docTypeId,
  orgId,
  createdBy,
  prefix,
  suffix,
  createprefandsuff,
) => {
  try {
    const prefixAndSuffixExist = await prefixTable.findMany({
      where: {
        moduleType: docTypeId,
        location: locationId,
      },
    });
    if (prefixAndSuffixExist.length === 0) {
      const result = await prefixTable.create({
        data: {
          moduleType: docTypeId,
          prefix: prefix,
          suffix: suffix,
          location: locationId,
          createdBy,
          organizationId: orgId,
        },
      });

      return result;
      // const createPrefixAndSuffix = await prefixTable.create({ data: {
      //   moduleType: docTypeId,
      //   location: location,
      //   createdBy: createdBy,
      //   organizationId: orgId,
      // },})
    }
    return 'data already exist';
  } catch (err) {}
};
export const documentAdminsCreator = async (
  adminsArray,
  documentAdminsTable,
  idOfDocumentTobeLinkedWith,
  adminType,
) => {
  try {
    for (const creator of adminsArray) {
      //////////////console.log('creator 1', creator);
      await documentAdminsTable.create({
        type: adminType,
        firstname: creator.firstname,
        lastname: creator.lastname,
        email: creator.email,
        userId: creator.userId ? creator.userId : creator.id,
        documentId: idOfDocumentTobeLinkedWith,
      });
    }
  } catch (err) {
    throw new HttpException(
      'Error occured while linking documents with creators,approvers and reviewers',
      404,
    );
  }
};

export const adminsSeperators = (documentAdmins) => {
  const creators = [];
  const approvers = [];
  const reviewers = [];
  const readers = [];

  documentAdmins.forEach((item) => {
    ////////console.log('item', item);
    if (item.type == 'CREATOR') {
      creators.push({
        ...item,
        label: item.email,
        avatar: item.user.avatar,
        id: item.user.id,
      });
    } else if (item.type == 'REVIEWER') {
      reviewers.push({
        ...item,
        label: item.email,
        avatar: item.user.avatar,
        id: item.user.id,
      });
    } else if (item.type == 'READER') {
      readers.push({
        ...item,
        label: item.email,
        avatar: item.user.avatar,
        id: item.user.id,
      });
    } else {
      approvers.push({
        ...item,
        label: item.email,
        avatar: item.user.avatar,
        id: item.user.id,
      });
    }
  });

  return {
    creators: creators,
    approvers: approvers,
    reviewers: reviewers,
    readers: readers,
  };
};
export const sendMailForReview = async (
  user,
  userInfo,
  documentInfo,
  sendNM,
) => {
  const emailMessage = `
  <p> 
  Following document has been created and sent for review</p>
  <p>DocumentType:${documentInfo.docType}</p>
  <p>DocumentName:${documentInfo.documentName}</p>
  <p>Corp Func/Unit:${documentInfo.creatorLocation.locationName}</p>
  <p>Department:${documentInfo.creatorEntity.entityName}</p>
  <p>Createdby:${user.firstname} ${user.lastname}</p>
  <p>${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}
  </p>
  `;
  const emailMessageIP = `
  
  Following document has been created and sent for review
  DocumentType:${documentInfo.docType}
  DocumentName:${documentInfo.documentName}
  Corp Func/Unit:${documentInfo.creatorLocation.locationName}
  Department:${documentInfo.creatorEntity.entityName}
  Createdby:${user.firstname} ${user.lastname}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}" 
  `;

  const msg = {
    to: userInfo.email, // Change to your recipient
    from: process.env.REPLY_TO, // Change to your verified sender
    subject: `${documentInfo.documentName} has been sent for review`,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await sendNM(
        userInfo.email,
        `${documentInfo.documentName} has been sent for review`,
        emailMessageIP,
      );
      ////console.log('sent mail');
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
      // console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      // console.error('An error occurred:', error.message);
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
  //console.log('sending the send for edit mail');
  const emailMessage = `
  <p> 
  Following document has been reviewed and sent back for edit</p>
  <p>DocumentType:${documentInfo.docType}</p>
  <p>DocumentName:${documentInfo.documentName}</p>
  <p>Reason:${comment}</p>
  <p>Corp Func/Unit:${documentInfo.creatorLocation.locationName}</p>
  <p>Department:${documentInfo.creatorEntity.entityName}</p>
  <p>Reviewed by:${user.firstname} ${user.lastname}</p>
  <p>${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}
  </p>
    `;
  const emailMessageIP = `
  Following document has been reviewed and sent back for edit
  DocumentType:${documentInfo.docType}
  DocumentName:${documentInfo.documentName}
  Reason:${comment}
  Corp Func/Unit:${documentInfo.creatorLocation.locationName}
  Department:${documentInfo.creatorEntity.entityName}
  Reviewed By:${user.firstname} ${user.lastname}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}" 
    `;
  const msg = {
    to: userInfo.email, // Change to your recipient
    from: process.env.REPLY_TO, // Change to your verified sender
    subject: `${documentInfo.documentName} has been reviewed and sent back for edit`,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await sendNM(
        userInfo.email,
        `${documentInfo.documentName} has been reviewed and sent back for edit`,
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
};
export const sendMailForApproval = async (
  user,
  userInfo,
  documentInfo,
  sendNM,
) => {
  // //console.log('sending the mail');
  const creDocCode = documentInfo.versionInfo?.find(
    (item: any) => item.type === 'CREATOR',
  )?.docCode;
  const revDocCode = documentInfo.versionInfo?.find(
    (item: any) => item.type === 'REVIEWER',
  )?.docCode;
  let docChangeMsg = '';
  if (creDocCode && revDocCode) {
    if (creDocCode !== revDocCode) {
      if (process.env.MAIL_SYSTEM !== 'IP_BASED') {
        docChangeMsg = `
        <p><strong>Reviewer has made changes to the document, please go to the document to view changes.</strong></p>
        `;
      } else {
        docChangeMsg =
          'Reviewer has made changes to the document, please go to the document to view changes.';
      }
    }
  }
  const emailMessage = `
  <p> 
  Following document has been reviewed and sent for approval</p>
  <p>DocumentType:${documentInfo.docType}</p>
  <p>DocumentName:${documentInfo.documentName}</p>
  <p>Corp Func/Unit:${documentInfo.creatorLocation.locationName}</p>
  <p>Department:${documentInfo.creatorEntity.entityName}</p>
  <p>Reviewed by:${user.firstname} ${user.lastname}</p>
  ${docChangeMsg}
  <p>${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}</p>
  </p>
  `;
  const emailMessageIP = `
  Following document has been reviewed and sent for approval
  DocumentType:${documentInfo.docType}
  DocumentName:${documentInfo.documentName}
  Corp Func/Unit:${documentInfo.creatorLocation.locationName}
  Department:${documentInfo.creatorEntity.entityName}
  Reviewed By:${user.firstname} ${user.lastname}
  ${docChangeMsg}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}" 
  `;
  const msg = {
    to: userInfo.email, // Change to your recipient
    from: process.env.REPLY_TO, // Change to your verified sender
    subject: `${documentInfo.documentName} has been reviewed and sent for approval`,
    html: `<div>${emailMessage}</div>`,
  };
  //////////console.log('msg', msg);
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await sendNM(
        userInfo.email,
        `${documentInfo.documentName} has been reviewed and sent for approval`,
        emailMessageIP,
      );
      // //console.log('sent mail');
    } else {
      const finalResult = await sgMail.send(msg);
    }
  } catch (error) {
    ////////console.log('error mail not sent', error);
  }
};
export const sendMailPublished = async (userInfo, documentInfo, sendNM) => {
  // //console.log('sending the published mail', documentInfo);
  const emailMessage = `
  <p> 
  Following document has been published and distributed</p>
  <p>Number:${documentInfo.documentNumbering}</p>
  <p>Doctype:${documentInfo.docType}</p>
  <p>Name:${documentInfo.documentName}</p>
  <p>Corp Func/Unit:${documentInfo.creatorLocation.locationName}</p>
  <p>Department:${documentInfo.creatorEntity.entityName}</p>
  <p>${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}
  </p>
  `;
  const emailMessageIP = `
  Following document has been published and distributed
  Number:${documentInfo.documentNumbering}
  Name:${documentInfo.documentName}
  DocumentType:${documentInfo.docType}
  Corp Func/Unit:${documentInfo.creatorLocation.locationName}
  Department:${documentInfo.creatorEntity.entityName}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}"
  `;
  const msg = {
    to: userInfo.email, // Change to your recipient
    from: process.env.REPLY_TO, // Change to your verified sender
    subject: `${documentInfo.documentName} has been published and distributed for reference`,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      try {
        const result = await sendNM(
          userInfo.email,
          `${documentInfo.documentName} has been published and distributed for reference`,
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
};
export const sendMailPublishedForAdmins = async (
  user,
  userInfo,
  documentInfo,
  sendNM,
) => {
  // //console.log('sending the mail for admins', userInfo, documentInfo);
  const emailMessage = `
  <p> 
  Following document has been published and distributed</p>
  <p>Number:${documentInfo.documentNumbering}</p>
  <p>DocumentType:${documentInfo.docType}</p>
  <p>Name:${documentInfo.documentName}</p>
  <p>Corp Func/Unit:${documentInfo.creatorLocation.locationName}</p>
  <p>Department:${documentInfo.creatorEntity.entityName}</p>
  <p>Published by:${user.firstname}${user.lastname}</p>
  <p>${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}
  </p>
  `;
  const emailMessageIP = `
  Following document has been published and distributed
  Number:${documentInfo.documentNumbering}
  Name:${documentInfo.documentName}
  DocumentType:${documentInfo.docType}
  Corp Func/Unit:${documentInfo.creatorLocation.locationName}
  Department:${documentInfo.creatorEntity.entityName}
  Published By:${userInfo.firstname}${userInfo.lastname}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}"
  `;
  const msg = {
    to: userInfo.email, // Change to your recipient
    from: process.env.FROM, // Change to your verified sender
    subject: `${documentInfo.documentName} has been published`,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await sendNM(
        userInfo.email,
        `${documentInfo.documentNumbering} has been published`,
        emailMessageIP,
      );
      // //console.log('sent mail');
    } else {
      try {
        const finalResult = await sgMail.send(msg);
      } catch (error) {
        throw error;
      }
    }
  } catch (error) {
    //////console.log('error');
  }
};
export const sendMailPublishedForDocumentAdmins = async (
  user,
  userInfo,
  documentInfo,
  sendNM,
) => {
  // //console.log('sending the mail for document admins', userInfo, documentInfo);
  const revDocCode = documentInfo?.versionInfo?.find(
    (item: any) => item.type === 'REVIEWER',
  )?.docCode;
  const appDocCode = documentInfo?.versionInfo?.find(
    (item: any) => item.type === 'APPROVER',
  )?.docCode;
  let docChangeMsg = '';
  if (appDocCode && revDocCode) {
    if (appDocCode !== revDocCode) {
      if (process.env.MAIL_SYSTEM !== 'IP_BASED') {
        docChangeMsg = `
        <p><strong>Approver has made changes to the document, please go to the document to view changes.</strong></p>
        `;
      } else {
        docChangeMsg =
          'Approver has made changes to the document, please go to the document to view changes.';
      }
    }
  }

  const emailMessage = `
  <p> 
  Following document has been published</p>
  <p>Number:${documentInfo.documentNumbering}</p>
  <p>Name:${documentInfo.documentName}</p>
  <p>DocumentType:${documentInfo.docType}</p>
  <p>Corp Func/Unit:${documentInfo.creatorLocation.locationName}</p>
  <p>Department:${documentInfo.creatorEntity.entityName}</p>
  <p>Published by:${user.firstname}${user.lastname}</p>
  ${docChangeMsg}
  <p>${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}</p>
  </p>
  `;
  const emailMessageIP = `
  Following document has been published
  Number:${documentInfo.documentNumbering}
  Name:${documentInfo.documentName}
  DocumentType:${documentInfo.docType}
  Corp Func/Unit:${documentInfo.creatorLocation.locationName}
  Department:${documentInfo.creatorEntity.entityName}
  Published By:${user.firstname}${user.lastname}
  ${docChangeMsg}
  Link:"${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}"
  `;
  const msg = {
    to: userInfo.email, // Change to your recipient
    from: process.env.FROM, // Change to your verified sender
    subject: `${documentInfo.documentName} has been published`,
    html: `<div>${emailMessage}</div>`,
  };
  // //console.log('document number', `${documentInfo.documentNumbering}`);
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await sendNM(
        userInfo.email,
        `${documentInfo.documentName} has been published`,
        emailMessageIP,
      );
      // //console.log('sent mail');
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
  <p>Corp Func/Unit:${documentInfo.creatorLocation?.locationName}</p>
  <p>Department:${documentInfo.creatorEntity?.entityName}</p>
  <p>Published by:${userInfo.firstname}${userInfo.lastname}</p>
  <p>${process.env.PROTOCOL}://${documentInfo.organization.realmName}.${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}
  </p>
  `;
  const emailMessageIP = `  
  Following document ${documentInfo.documentName} is due for revision. 
  Number:${documentInfo.documentNumbering}
  Name:${documentInfo.documentName}
  DocumentType:${documentInfo.docType}
  Corp Func/Unit:${documentInfo.creatorLocation.locationName}
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
