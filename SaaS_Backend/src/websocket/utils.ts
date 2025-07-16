import { type } from 'os';

export const groupNotificationSender = async (
  notificationRecievers,
  currentUser,
  contentId,
  message,
  style,
  type,
  socket,
  notificationService,
  readAccessChannel?,
) => {
  let notification;
  if (notificationRecievers.length > 0) {
    for (const user of notificationRecievers) {
      // creating new notification
      notification = {
        content: contentId,
        text: message,
        style: style,
        type: type,
        creator: currentUser.id,
        receiver: user.userId ? user.userId : user.id,
      };
      const res = await notificationService.create(notification);
      // ("noti", res)
      socket.to(user.userId).emit('notifications', res);
    }
    return notification;
  } else if (readAccessChannel) {
    notification = {
      content: contentId,
      text: message,
      style: style,
      type: type,
      creator: currentUser.id,
      receiver: currentUser.id,
    };

    const res = await notificationService.create(notification);
    // ("noti", res)
    socket.to(readAccessChannel).emit('notifications', res);
  }
};

// export const sendEmail = async (emailRecivers, message, sgMail, userTable) => {
//   const pendingPromises = [];
//   let emailMessage = ``;

//   // //////////////console.log("userTable",userTable)

//   for (const user of emailRecivers) {
//     const userInDb = await userTable.findFirst({
//       where: {
//         id: user.userId,
//       },
//     });

//     // email message to sent
//     emailMessage = `
//             Hello, ${userInDb.firstname}

//             ${message}
//         `;

//     const msg = {
//       to: userInDb.email, // Change to your recipient
//       from: process.env.FROM, // Change to your verified sender
//       subject: 'Process document ,updates',
//       text: message,
//       html: `<strong>${emailMessage}</strong>`,
//     };

//     pendingPromises.push(sgMail.send(msg));
//   }

//   const result = await Promise.all(pendingPromises);

//   // const finalEmailList = [...new Set(reciversEmailArray)]

//   // sgMail
//   // .send(msg)
//   // .then(() => {
//   //     //////////////console.log('Email sent')
//   // })
//   // .catch((error) => {
//   //     console.error(error.response.body)
//   // })
// };
