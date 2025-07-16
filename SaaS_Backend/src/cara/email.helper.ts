import * as sgMail from '@sendgrid/mail';
sgMail.setApiKey(
  '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',
);

export const sendMailToDeptHead = async (
  user,
  capa,
  originname,
  activeUser,
  mailService,
) => {
  // console.log('user', user);
  const emailMessageIP = `
      Hello, ${user?.username}
  
      CAPA:${capa.title} has been initiated with origin ${originname}  by ${activeUser?.firstname}${activeUser?.lastname} 
     
      Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/cara/caraForm/${capa?._id}" click for details
        `;
  const emailMessage = `
        <p>Hello,  ${user?.username} </p>
        <p> CAPA:${capa.title} has been initiated with origin ${originname}  by ${activeUser?.firstname}${activeUser?.lastname} 
     </p>
        Here is the link "${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/cara/caraForm/${capa?._id}"
       
  
        `;

  const msg = {
    to: user?.email, // attendee
    from: process.env.FROM, // MR
    subject: `CAPA has been initiated `,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `CAPA has been initiated`,
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
export const sendMailToDeptHeadToApprove = async (
  user,
  capa,
  activeUser,
  mailService,
) => {
  const emailMessageIP = `
      Hello, ${user?.username}
  
     CAPA:${capa.title} has been updated by CAPA Owner ${activeUser?.firstname}${activeUser?.lastname} and awaiting your approval to proceed.
      Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/cara" click for details
        `;
  const emailMessage = `
        <p>Hello,  ${user?.username} </p>
        <p> CAPA:${capa.title} has been updated by CAPA Owner ${activeUser?.firstname}${activeUser?.lastname} and awaiting your approval to proceed.
     </p>
        Here is the link "${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/cara/caraForm/${capa?._id}"
       
  
        `;

  const msg = {
    to: user?.email, // attendee
    from: process.env.FROM, // MR
    subject: `CAPA ${capa.title} has been updated with root cause analysis `,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `CAPA ${capa?.title} has been updated with root cause analysis`,
        emailMessageIP,
      );
      // //console.log('sent mail');
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
      console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      console.error('An error occurred:', error.message);
    }
  }
};
export const sendMailToDeptHeadForClosure = async (
  user,
  capa,
  activeUser,
  mailService,
) => {
  const emailMessageIP = `
      Hello, ${user?.username}
  
     CAPA:${capa.title} has been updated by CAPA Owner ${activeUser?.firstname}${activeUser?.lastname}.
     
      Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/cara/caraForm/${capa?._id}" click for details
        `;
  const emailMessage = `
        <p>Hello,  ${user?.username} </p>
        <p> CAPA:${capa.title} has been updated by CAPA Owner ${activeUser?.firstname}${activeUser?.lastname} 
     </p>
         Here is the link "${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/cara/caraForm/${capa?._id}"
       
  
        `;

  const msg = {
    to: user?.email, // attendee
    from: process.env.FROM, // MR
    subject: `CAPA ${capa.title} has been updated with corrective action `,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `CAPA ${capa.title} has been updated with corrective action`,
        emailMessageIP,
      );
      // //console.log('sent mail');
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
      console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      console.error('An error occurred:', error.message);
    }
  }
};
export const sendMailToExecutiveForClosure = async (
  user,
  capa,
  activeUser,
  mailService,
) => {
  const emailMessageIP = `
      Hello, ${user?.username}
  
     CAPA:${capa.title} has been updated by CAPA Owner ${activeUser?.firstname}${activeUser?.lastname} and awaiting your approval for closure.
     
      Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/cara" click for details
        `;
  const emailMessage = `
        <p>Hello,  ${user?.username} </p>
        <p> CAPA:${capa.title} has been updated by CAPA Owner ${activeUser?.firstname}${activeUser?.lastname} and awaiting your approval for closure.
     </p>
        Here is the link "${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/cara"
       
  
        `;
  console.log('inside mail for approval');
  const msg = {
    to: user?.email, // attendee
    from: process.env.FROM, // MR
    subject: `CAPA ${capa.title} has been sent for your approval `,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `CAPA ${capa.title}has been sent for your approval`,
        emailMessageIP,
      );
      // //console.log('sent mail');
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
      console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      console.error('An error occurred:', error.message);
    }
  }
};

export const sendMailToCapaInitiatorOnClosure = async (
  user,
  capa,
  activeUser,
  mailService,
) => {
  const emailMessageIP = `
      Hello, ${user?.username}
  
     CAPA:${capa.title} has been closed 
     
      Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/cara/caraForm/${capa?._id}" click for details
        `;
  const emailMessage = `
        <p>Hello,  ${user?.username} </p>
        <p> CAPA:${capa.title} has been Closed
     </p>
         Here is the link "${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/cara/caraForm/${capa?._id}"
       
  
        `;

  const msg = {
    to: user?.email, // attendee
    from: process.env.FROM, // MR
    subject: `CAPA ${capa.title} has been closed `,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `CAPA ${capa.title} has been closed`,
        emailMessageIP,
      );
      // //console.log('sent mail');
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
      console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      console.error('An error occurred:', error.message);
    }
  }
};
export const sendMailToCapaInitiatorOnReject = async (
  user,
  capa,
  activeUser,
  mailService,
) => {
  const emailMessageIP = `
      Hello, ${user?.username}
  
     CAPA:${capa.title} has been rejected.
     Reason for rejection:${capa.comments}
     
      Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/cara/caraForm/${capa?._id}" click for details
        `;
  const emailMessage = `
        <p>Hello,  ${user?.username} </p>
        <p> CAPA:${capa.title} has been rejected. Reason for rejection:${capa.comments}
     </p>
        Here is the link "${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/cara/caraForm/${capa?._id}"
       
  
        `;

  const msg = {
    to: user?.email, // attendee
    from: process.env.FROM, // MR
    subject: `CAPA ${capa.title} has been rejected `,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `CAPA ${capa.title} has been rejected`,
        emailMessageIP,
      );
      // //console.log('sent mail');
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
      console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      console.error('An error occurred:', error.message);
    }
  }
};
export const sendMailToCapaOwnerOnChange = async (
  user,
  capa,
  activeUser,
  mailService,
) => {
  const emailMessageIP = `
      Hello, ${user?.username}
  
     You have been assigned as the owner for the CAPA:${capa?.title}
     
      Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/cara/caraForm/${capa?._id}" click for details
        `;
  const emailMessage = `
        <p>Hello,  ${user?.username} </p>
        <p>   You have been assigned as the owner for the CAPA:${capa.title}
     </p>
        Here is the link "${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/cara/caraForm/${capa?._id}"
       
  
        `;

  const msg = {
    to: user?.email,
    from: process.env.FROM,
    subject: `CAPA ${capa.title} has a new owner `,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `CAPA ${capa.title} has a new owner`,
        emailMessageIP,
      );
      // //console.log('sent mail');
    } else {
      try {
        console.log('sending mail');
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
      console.error('SendGrid Error:', error.response.body.errors);
    } else {
      // Handle other types of errors
      console.error('An error occurred:', error.message);
    }
  }
};
