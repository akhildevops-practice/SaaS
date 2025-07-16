import * as sgMail from '@sendgrid/mail';
sgMail.setApiKey(
  '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',
);
export const sendMailToUserOnTransfer = async (
  user,

  activeUser,
  mailService,
) => {
  const emailMessageIP = `
        Hello, ${user?.username}
    
       You have been transferred to location:${user.location?.locationName}. Please contact respective unit MR for further processing and smooth transfer.
       
                `;
  const emailMessage = `
          <p>Hello,  ${user?.username} </p>
          <p>    You have been transferred to location:${user.locationName}. Please contact respective unit MR for further processing and smooth transfer.
       </p>
          
          `;

  const msg = {
    to: user?.email,
    from: process.env.FROM,
    subject: `You have been successfully transferred`,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `You have been successfully transferred`,
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

export const sendMailToMROnTransfer = async (
  user,

  mailService,
) => {
  const emailMessageIP = `
          Hello, ${user?.username}
      
         This is to inform you that few users have been transferred to your unit. Please assign the users respective to their respective departments for a complete transfer process.
           Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/master" click for details

           PS:Roles have to be reassigned if required. Else existing roles will be retained.
        
            `;
  const emailMessage = `
            <p>Hello,  ${user?.username} </p>
            <p>     
            This is to inform you that few users have been transferred to your unit. Please assign the users respective to their respective departments for a complete transfer process.
            Here is the link "${process.env.PROTOCOL}://${process.env.REDIRECT}/master" click for details

           PS:Roles have to be reassigned if required. Else existing roles will be retained.
                 </p>
            
            `;

  const msg = {
    to: user?.email,
    from: process.env.FROM,
    subject: `Users have been transferred`,
    html: `<div>${emailMessage}</div>`,
  };
  try {
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      const result = await mailService(
        user.email,
        `Users have been transferred`,
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
