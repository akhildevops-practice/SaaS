// import {
//   ConnectedSocket,
//   MessageBody,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
//   WsResponse,
// } from '@nestjs/websockets';
// import { groupCollapsed } from 'console';
// import { Socket } from 'socket.io';
// import { DoctypeService } from 'src/doctype/doctype.service';
// import { adminsSeperators } from 'src/doctype/utils';
// import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
// import { NotificationService } from 'src/notification/notification.service';
// import { PrismaService } from 'src/prisma.service';
// import { UserService } from 'src/user/user.service';
// import {
//   notificationEvents,
//   notificationTypes,
// } from '../utils/notificationEvents.global';
// //import { groupNotificationSender, sendEmail } from './utils';
// import * as sgMail from '@sendgrid/mail';
// import { emailMessageTemplate } from '../utils/emailMessages/emailMessages';
// import { OrganisationController } from 'src/organization/organization.controller';
// import { InternalServerErrorException } from '@nestjs/common';

// sgMail.setApiKey(process.env.SMTP_PASSWORD);

// /**
//  * @Desc
//  * When a new user joins via web socket. He emits the "join" event with his userId as data. Then we join him to a room named similar to his userId.
//  * Now a room created with his user id acts as a private channel to him to which only he will be listening.
//  * So we will emit notification events to this channel he can easily listen to this events.
//  */
// @WebSocketGateway()
// export class SocketGateway {
//   constructor(
//     private prisma: PrismaService,
//     private readonly notificationService: NotificationService,
//     private docTypeService: DoctypeService,
//     private readonly userService: UserService,
//   ) {}

//   @WebSocketServer()
//   server;

//   handleConnection() {}

//   /**
//    * @Desc This method handles new socket connection. When a new user connects through websocket.
//    * @param socket Socket Object
//    * @param data User ID
//    */
//   @SubscribeMessage('join')
//   async createRoom(socket: Socket, data: any) {
//     let user;
//     // joining user to a room of his user ID. To create a private channel
//     socket.join(data.id);

//     if (data.id) {
//       user = await this.prisma.user.findUnique({
//         where: {
//           id: data.id,
//         },
//       });

//       socket.join(user.organizationId);
//       socket.emit('success', { data: 'You joined the room' });
//       socket.emit('join', { data: 'You joined the room' });
//     }
//   }

//   /**
//    * @Desc This function handles the document type created event emitted by the socket io client.
//    * @param socket Socket Object
//    * @param data DocumentType Data
//    */
//   @SubscribeMessage('documentTypeCreated')
//   async handleDocumentTypeCreated(socket: Socket, data: any) {
//     const docType = data.data;
//     const currentUser = await this.prisma.user.findFirst({
//       where: {
//         id: data.currentUser,
//       },
//     });

//     //array of groups of users to send notification to
//     //all distinct groups will have distnict messages
//     //for users in the same group , all messages will be same
//     const userGroups = [];

//     if (docType.approvers.length > 0) {
//       userGroups.push({ type: 'approvers', users: docType.approvers });
//     }
//     if (docType.creators.length > 0) {
//       userGroups.push({ type: 'creators', users: docType.creators });
//     }
//     if (docType.reviewers.length > 0) {
//       userGroups.push({ type: 'reviewrs', users: docType.reviewers });
//     }

//     await this.notificationsSender(
//       userGroups,
//       currentUser,
//       docType.documentTypeName,
//       docType.id,
//       'docType',
//       socket,
//       true,
//       false,
//     );
//     return;
//   }

//   /**
//    * @Desc This method handles the document type updated notification event. It emits notification to the newly added
//    *         approvers , creators and reviewers.
//    * @param socket Socket Object
//    * @param data DocumentType Data
//    */
//   @SubscribeMessage('documentTypeUpdated')
//   async handleDocumentTypeUpdated(socket: Socket, data: any) {
//     try {
//       const docType = data.data; // doc data form client

//       // getting the current user
//       const currentUser = await this.prisma.user.findFirst({
//         where: {
//           id: data.currentUser,
//         },
//       });

//       const userGroups = [];

//       if (docType.approvers.length > 0) {
//         userGroups.push({ type: 'approvers', users: docType.approvers });
//       }
//       if (docType.creators.length > 0) {
//         userGroups.push({ type: 'creators', users: docType.creators });
//       }
//       if (docType.reviewers.length > 0) {
//         userGroups.push({ type: 'reviewrs', users: docType.reviewers });
//       }

//       await this.notificationsSender(
//         userGroups,
//         currentUser,
//         docType.documentTypeName,
//         docType.id,
//         'docType',
//         socket,
//         true,
//         false,
//       );
//       return;
//     } catch (err) {
//       // console.error(err);
//     }
//   }

//   /**
//    * @Desc This method handles the document type updated notification event. It emits notification to the newly added
//    *         approvers , creators and reviewers.
//    * @param socket Socket Object
//    * @param data DocumentType Data
//    */
//   @SubscribeMessage('documentPublished')
//   async handleDocumentPublished(socket: Socket, data: any) {
//     try {

//       const currentUser = await this.prisma.user.findFirst({
//         where: {
//           id: data.currentUser,
//         },
//       });

//       const documentId = data.data.id;
//       const document = await this.prisma.documents.findUnique({
//         where: {
//           id: documentId,
//         },
//         include: {
//           AdditionalDocumentAdmins: true,
//           doctype: true,
//           organization: {
//             select: {
//               realmName: true,
//             },
//           },
//         },
//       });

//       const creators = await this.prisma.documentAdmins.findMany({
//         where: {
//           AND: [
//             {
//               doctypeId: document.doctypeId,
//             },
//             {
//               type: 'CREATOR',
//             },
//           ],
//         },
//       });

//       const readersOfRestrictedAccess =
//         await this.prisma.documentAdmins.findMany({
//           where: {
//             AND: [
//               {
//                 doctypeId: document.doctypeId,
//               },
//               {
//                 type: 'READER',
//               },
//             ],
//           },
//         });

//       const readAccess = document.doctype.readAccess;

//       let additionalDocumentAdmins = document.AdditionalDocumentAdmins;
//       let seperatedAdmins = adminsSeperators(additionalDocumentAdmins);

//       if (document.documentState === 'PUBLISHED') {

//         if (readAccess == 'Organization') {

//           const allUsersOfOrganization = await this.prisma.user.findMany({
//             where: {
//               organizationId: currentUser.organizationId,
//             },
//           });

//           const message = `${currentUser.firstname} ${currentUser.lastname} has published document  - ${document.documentName}  `;

//           const notification = await groupNotificationSender(
//             allUsersOfOrganization,
//             currentUser,
//             document.id,
//             message,
//             'primary',
//             'document',
//             socket,
//             this.notificationService,
//             currentUser.organizationId,
//           );

//           const sendMail = await sendEmail(
//             allUsersOfOrganization,
//             message,
//             sgMail,
//             this.prisma.user,
//           );
//         } else if (readAccess == 'Restricted Access') {
//           const usersWithAccess = [];
//           const readers = seperatedAdmins.readers;

//           readers ? usersWithAccess.push(...readers) : null;
//           readersOfRestrictedAccess
//             ? usersWithAccess.push(...readersOfRestrictedAccess)
//             : null;
//           if (usersWithAccess) {
//             const message = `${currentUser.firstname} ${currentUser.lastname} has published document - ${document.documentName} `;

//             const notification = await groupNotificationSender(
//               usersWithAccess,
//               currentUser,
//               document.id,
//               message,
//               'primary',
//               'document',
//               socket,
//               this.notificationService,
//             );

//             const sendMail = await sendEmail(
//               usersWithAccess,
//               message,
//               sgMail,
//               this.prisma.user,
//             );
//           }
//         } else if (readAccess == "Creator's Location") {
//           const allUsersOfCreatorsLocation = await this.prisma.user.findMany({
//             where: {
//               locationId: currentUser.locationId,
//             },
//           });

//           if (allUsersOfCreatorsLocation.length > 0) {
//             const message = `${currentUser.firstname} ${currentUser.lastname} has published document- ${document.documentName} `;

//             const notification = await groupNotificationSender(
//               allUsersOfCreatorsLocation,
//               currentUser,
//               document.id,
//               message,
//               'primary',
//               'document',
//               socket,
//               this.notificationService,
//             );

//             const sendMail = await sendEmail(
//               allUsersOfCreatorsLocation,
//               message,
//               sgMail,
//               this.prisma.user,
//             );
//           }
//         } else if (readAccess == "Creator's Entity") {
//           let usersWithAccess = [];
//           let allUsersOfCreatorsDepartment;
//           for (const creator of creators) {
//             const creatorDetails = await this.prisma.user.findFirst({
//               where: {
//                 id: creator.userId,
//               },
//             });

//             allUsersOfCreatorsDepartment = await this.prisma.user.findMany({
//               where: {
//                 entityId: creatorDetails.entityId,
//               },
//             });

//             usersWithAccess.push(...allUsersOfCreatorsDepartment);
//           }

//           if (usersWithAccess.length > 0) {
//             const message = `${currentUser.firstname} ${currentUser.lastname} has published document - ${document.documentName} `;
//             const notification = await groupNotificationSender(
//               usersWithAccess,
//               currentUser,
//               document.id,
//               message,
//               'primary',
//               'document',
//               socket,
//               this.notificationService,
//             );

//             const sendMail = await sendEmail(
//               usersWithAccess,
//               message,
//               sgMail,
//               this.prisma.user,
//             );
//           }
//         }
//       }
//     } catch (err) {
//       // console.error(err);
//     }
//   }

//   /**
//    * @Desc This function handles the document update event emitted by the socket io client.
//    */
//   @SubscribeMessage('documentUpdated')
//   async handleDocumentUpdated(socket: Socket, data: any) {
//     try {
//       const currentUser = await this.prisma.user.findFirst({
//         where: {
//           id: data.currentUser,
//         },
//       });

//       const documentId = data.data.id;
//       const document = await this.prisma.documents.findUnique({
//         where: {
//           id: documentId,
//         },
//         include: {
//           AdditionalDocumentAdmins: true,
//           doctype: true,
//           organization: {
//             select: {
//               realmName: true,
//             },
//           },
//         },
//       });

//       const creators = await this.prisma.documentAdmins.findMany({
//         where: {
//           AND: [
//             {
//               doctypeId: document.doctypeId,
//             },
//             {
//               type: 'CREATOR',
//             },
//           ],
//         },
//       });

//       const readersOfRestrictedAccess =
//         await this.prisma.documentAdmins.findMany({
//           where: {
//             AND: [
//               {
//                 doctypeId: document.doctypeId,
//               },
//               {
//                 type: 'READER',
//               },
//             ],
//           },
//         });

//       let additionalDocumentAdmins = document.AdditionalDocumentAdmins;
//       let seperatedAdmins = adminsSeperators(additionalDocumentAdmins);

//       const notificationRecievers = [];

//       notificationRecievers.push(
//         ...seperatedAdmins.creators,
//         ...seperatedAdmins.reviewers,
//         ...seperatedAdmins.approvers,
//         ...seperatedAdmins.readers,
//       );

//       if (document.documentState === 'IN_REVIEW') {
//         const message = `${currentUser.firstname} ${currentUser.lastname} has sent document - ${document.documentName} for review`;
//         const emailMessage = emailMessageTemplate.IN_REVIEW(
//           currentUser,
//           document,
//         );
//         const sendNotifications = await groupNotificationSender(
//           seperatedAdmins.reviewers,
//           currentUser,
//           document.id,
//           message,
//           'success',
//           'document',
//           socket,
//           this.notificationService,
//         );
//         const sendMail = await sendEmail(
//           seperatedAdmins.reviewers,
//           emailMessage,
//           sgMail,
//           this.prisma.user,
//         );
//       } else if (document.documentState === 'IN_APPROVAL') {
//         const message = `${currentUser.firstname} ${currentUser.lastname} has sent document - ${document.documentName} for Approval `;
//         const emailMessage = emailMessageTemplate.IN_APPROVAL(
//           currentUser,
//           document,
//         );
//         const sendNotifications = await groupNotificationSender(
//           seperatedAdmins.approvers,
//           currentUser,
//           document.id,
//           message,
//           'success',
//           'document',
//           socket,
//           this.notificationService,
//         );
//         const sendMail = await sendEmail(
//           seperatedAdmins.approvers,
//           emailMessage,
//           sgMail,
//           this.prisma.user,
//         );
//       } else if (
//         document.documentState === 'DRAFT' &&
//         (data.data.state = 'Send for Edit')
//       ) {
//         const message = `${currentUser.firstname} ${currentUser.lastname} has sent document - ${document.documentName} for edit`;
//         const emailMessage = emailMessageTemplate.IN_EDIT(
//           currentUser,
//           document,
//         );
//         const emailRecivers = [];
//         if (data.data.state === 'Send for Edit') {
//           const sendNotifications = await groupNotificationSender(
//             creators,
//             currentUser,
//             document.id,
//             message,
//             'warning',
//             'document',
//             socket,
//             this.notificationService,
//           );
//           const sendMail = await sendEmail(
//             creators,
//             emailMessage,
//             sgMail,
//             this.prisma.user,
//           );
//         }
//         // emailRecivers.push(...seperatedAdmins.reviewers, ...seperatedAdmins.approvers)
//         // const sendNotifications = await groupNotificationSender(emailRecivers, currentUser, document.id, message, "warning", "document", socket, this.notificationService)
//         // const sendMail = await sendEmail(creators, emailMessage, sgMail, this.prisma.user)
//       } else if (document.documentState === 'APPROVED') {
//         const message = `${currentUser.firstname} ${currentUser.lastname} has approved the document - ${document.documentName} `;
//         const emailMessage = emailMessageTemplate.APPROVED(
//           currentUser,
//           document,
//         );
//         const sendNotifications = await groupNotificationSender(
//           creators,
//           currentUser,
//           document.id,
//           message,
//           'success',
//           'document',
//           socket,
//           this.notificationService,
//         );
//         const sendMail = await sendEmail(
//           creators,
//           emailMessage,
//           sgMail,
//           this.prisma.user,
//         );
//       } else if (document.documentState === 'REVIEW_COMPLETE') {
//         const message = `${currentUser.firstname} ${currentUser.lastname} has reviewed the document - ${document.documentName} `;
//         const emailMessage = emailMessageTemplate.REVIEW_COMPLETE(
//           currentUser,
//           document,
//         );
//         const sendNotifications = await groupNotificationSender(
//           creators,
//           currentUser,
//           document.id,
//           message,
//           'success',
//           'document',
//           socket,
//           this.notificationService,
//         );
//         const sendMail = await sendEmail(
//           creators,
//           emailMessage,
//           sgMail,
//           this.prisma.user,
//         );
//       } else if (document.documentState === 'PUBLISHED') {
//         const message = `${currentUser.firstname} ${currentUser.lastname} has published the document - ${document.documentName} `;
//         const emailMessage = emailMessageTemplate.REVIEW_COMPLETE(
//           currentUser,
//           document,
//         );

//         const sendNotifications = await groupNotificationSender(
//           notificationRecievers,
//           currentUser,
//           document.id,
//           message,
//           'success',
//           'document',
//           socket,
//           this.notificationService,
//         );

//         //////////////////////////////////////////

//         const readersOfRestrictedAccess =
//           await this.prisma.documentAdmins.findMany({
//             where: {
//               AND: [
//                 {
//                   doctypeId: document.doctypeId,
//                 },
//                 {
//                   type: 'READER',
//                 },
//               ],
//             },
//           });

//         const readAccess = document.doctype.readAccess;

//         let additionalDocumentAdmins = document.AdditionalDocumentAdmins;
//         let seperatedAdmins = adminsSeperators(additionalDocumentAdmins);

//         if (readAccess == 'Organization') {

//           const allUsersOfOrganization = await this.prisma.user.findMany({
//             where: {
//               organizationId: currentUser.organizationId,
//             },
//           });

//           const message = `${currentUser.firstname} ${currentUser.lastname} has published document  - ${document.documentName}  `;

//           const notification = await groupNotificationSender(
//             allUsersOfOrganization,
//             currentUser,
//             document.id,
//             message,
//             'primary',
//             'document',
//             socket,
//             this.notificationService,
//             currentUser.organizationId,
//           );

//           // const sendMail = await sendEmail(allUsersOfOrganization, message, sgMail, this.prisma.user)
//         } else if (readAccess == 'Restricted Access') {
//           const usersWithAccess = [];
//           const readers = seperatedAdmins.readers;

//           readers ? usersWithAccess.push(...readers) : null;
//           readersOfRestrictedAccess
//             ? usersWithAccess.push(...readersOfRestrictedAccess)
//             : null;
//           if (usersWithAccess) {
//             const message = `${currentUser.firstname} ${currentUser.lastname} has published document - ${document.documentName} `;

//             const notification = await groupNotificationSender(
//               usersWithAccess,
//               currentUser,
//               document.id,
//               message,
//               'primary',
//               'document',
//               socket,
//               this.notificationService,
//             );

//             // const sendMail = await sendEmail(usersWithAccess, message, sgMail, this.prisma.user)
//           }
//         } else if (readAccess == "Creator's Location") {
//           const allUsersOfCreatorsLocation = await this.prisma.user.findMany({
//             where: {
//               locationId: currentUser.locationId,
//             },
//           });

//           if (allUsersOfCreatorsLocation.length > 0) {
//             const message = `${currentUser.firstname} ${currentUser.lastname} has published document- ${document.documentName} `;

//             const notification = await groupNotificationSender(
//               allUsersOfCreatorsLocation,
//               currentUser,
//               document.id,
//               message,
//               'primary',
//               'document',
//               socket,
//               this.notificationService,
//             );

//             // const sendMail = await sendEmail(allUsersOfCreatorsLocation, message, sgMail, this.prisma.user)
//           }
//         } else if (readAccess == "Creator's Entity") {
//           let usersWithAccess = [];
//           let allUsersOfCreatorsDepartment;
//           for (const creator of creators) {
//             const creatorDetails = await this.prisma.user.findFirst({
//               where: {
//                 id: creator.userId,
//               },
//             });

//             allUsersOfCreatorsDepartment = await this.prisma.user.findMany({
//               where: {
//                 entityId: creatorDetails.entityId,
//               },
//             });

//             usersWithAccess.push(...allUsersOfCreatorsDepartment);
//           }

//           if (usersWithAccess.length > 0) {
//             const message = `${currentUser.firstname} ${currentUser.lastname} has published document - ${document.documentName} `;
//             const notification = await groupNotificationSender(
//               usersWithAccess,
//               currentUser,
//               document.id,
//               message,
//               'primary',
//               'document',
//               socket,
//               this.notificationService,
//             );

//             // const sendMail = await sendEmail(usersWithAccess, message, sgMail, this.prisma.user)
//           }
//         }

//         /////////////////////////////////////////

//         const notification = await groupNotificationSender(
//           [],
//           currentUser,
//           document.id,
//           message,
//           'success',
//           'document',
//           socket,
//           this.notificationService,
//           currentUser.organizationId,
//         );

//         const sendMail = await sendEmail(
//           notificationRecievers,
//           emailMessage,
//           sgMail,
//           this.prisma.user,
//         );
//       } else if (document.documentState === 'AMMEND') {
//         const message = `${currentUser.firstname} ${currentUser.lastname} has amended the document - ${document.documentName} `;
//         const emailMessage = emailMessageTemplate.REVIEW_COMPLETE(
//           currentUser,
//           document,
//         );

//         const ammendRecievers = [];

//         ammendRecievers.push(
//           ...seperatedAdmins.approvers,
//           ...seperatedAdmins.reviewers,
//         );

//         const sendNotifications = await groupNotificationSender(
//           ammendRecievers,
//           currentUser,
//           document.id,
//           message,
//           'warning',
//           'document',
//           socket,
//           this.notificationService,
//         );

//         const sendMail = await sendEmail(
//           ammendRecievers,
//           emailMessage,
//           sgMail,
//           this.prisma.user,
//         );
//       }
//     } catch (err) {
//       // throw new InternalServerErrorException(
//       //   'Error while sending notifications',
//       // );
//     }
//   }

//   /**
//    * @Desc This function handles the document created event created event emitted by the socket io client.
//    * @param socket Socket Object
//    * @param data DocumentType Data
//    */
//   @SubscribeMessage('documentCreated')
//   async handleDocumentCreated(socket: Socket, data: any) {
//     const document = data.data;
//     const currentUser = await this.prisma.user.findFirst({
//       where: {
//         id: data.currentUser,
//       },
//     });

//     //array of groups of users to send notification to
//     //all distinct groups will have distnict messages
//     //for users in the same group , all messages will be same
//     const userGroups = [];

//     if (document.approvers?.length > 0) {
//       userGroups.push({ type: 'approvers', users: document.approvers });
//     }
//     if (document.readers?.length > 0) {
//       userGroups.push({ type: 'creators', users: document.readers });
//     }
//     if (document.reviewers?.length > 0) {
//       userGroups.push({ type: 'reviewrs', users: document.reviewers });
//     }

//     await this.notificationsSender(
//       userGroups,
//       currentUser,
//       document.documentName,
//       document.id,
//       'document',
//       socket,
//       false,
//       true,
//     );
//     return;
//   }

//   async notificationsSender(
//     arraysOfNotificationsReciverGroups,
//     notificationCreatorUser,
//     resourceNameOfNotification: string,
//     resourceIdOfNotification: string,
//     type: string,
//     socket: any,
//     update?,
//     create?,
//   ) {
//     //foreach type of group send these notifications tailored for each groups
//     for (const group of arraysOfNotificationsReciverGroups) {
//       //for each group
//       for (const user of group.users) {
//         //for each user in group
//         let notification: CreateNotificationDto;
//         if (group.type == 'approvers') {
//           if (create) {
//             // creating new notification
//             notification = {
//               content: resourceIdOfNotification,
//               text:
//                 type == 'docType'
//                   ? notificationEvents.docType.approver.message(
//                       `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname}`,
//                       resourceNameOfNotification,
//                     )
//                   : `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname} created a document - ${resourceNameOfNotification}`,
//               style:
//                 type == 'docType'
//                   ? notificationEvents.docType.approver.style
//                   : notificationEvents.document.approver.style,
//               type:
//                 type == 'docType'
//                   ? notificationTypes.docType
//                   : notificationTypes.document,
//               creator: notificationCreatorUser.id,
//               receiver: user.userId,
//             };
//           } else {
//             notification = {
//               content: resourceIdOfNotification,
//               text:
//                 type == 'docType'
//                   ? notificationEvents.docType.approver.message(
//                       `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname}`,
//                       resourceNameOfNotification,
//                     )
//                   : `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname} updated a document - ${resourceNameOfNotification}`,
//               style:
//                 type == 'docType'
//                   ? notificationEvents.docType.approver.style
//                   : notificationEvents.document.approver.style,
//               type:
//                 type == 'docType'
//                   ? notificationTypes.docType
//                   : notificationTypes.document,
//               creator: notificationCreatorUser.id,
//               receiver: user.userId,
//             };
//           }
//         } else if (group.type == 'reviewrs') {
//           if (create) {
//             notification = {
//               content: resourceIdOfNotification,
//               text:
//                 type == 'docType'
//                   ? notificationEvents.docType.reviewer.message(
//                       `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname}`,
//                       resourceNameOfNotification,
//                     )
//                   : `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname} created a document - - ${resourceNameOfNotification}`,
//               style:
//                 type == 'docType'
//                   ? notificationEvents.docType.reviewer.style
//                   : notificationEvents.document.reviewer.style,
//               type:
//                 type == 'docType'
//                   ? notificationTypes.docType
//                   : notificationTypes.document,
//               creator: notificationCreatorUser.id,
//               receiver: user.userId,
//             };
//           } else {
//             notification = {
//               content: resourceIdOfNotification,
//               text:
//                 type == 'docType'
//                   ? notificationEvents.docType.reviewer.message(
//                       `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname}`,
//                       resourceNameOfNotification,
//                     )
//                   : `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname} updated a document - - ${resourceNameOfNotification}`,
//               style:
//                 type == 'docType'
//                   ? notificationEvents.docType.reviewer.style
//                   : notificationEvents.document.reviewer.style,
//               type:
//                 type == 'docType'
//                   ? notificationTypes.docType
//                   : notificationTypes.document,
//               creator: notificationCreatorUser.id,
//               receiver: user.userId,
//             };
//           }
//         } else if (group.type == 'creators') {
//           notification = {
//             content: resourceIdOfNotification,
//             text:
//               type == 'docType'
//                 ? notificationEvents.docType.creator.message(
//                     `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname}`,
//                     resourceNameOfNotification,
//                   )
//                 : `${notificationCreatorUser.firstname} ${notificationCreatorUser.lastname} created a document`,
//             style:
//               type == 'docType'
//                 ? notificationEvents.docType.creator.style
//                 : notificationEvents.document.creator.style,
//             type:
//               type == 'docType'
//                 ? notificationTypes.docType
//                 : notificationTypes.document,
//             creator: notificationCreatorUser.id,
//             receiver: user.userId,
//           };
//         }

//         const res = await this.notificationService.create(notification);
//         socket.to(user.userId).emit('notifications', res);
//       }
//     }
//   }
// }
