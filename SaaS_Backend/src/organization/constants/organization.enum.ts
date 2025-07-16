import { FileFieldsInterceptor } from '@nestjs/platform-express';

export const CreateOrganizationEnums = {
  predefinedRolesArray: [
    'ORG-ADMIN',
    'MR',
    'GENERAL-USER',
    'AUDITOR',
    'REVIEWER',
    'APPROVER',
  ],
  createRealmDefaultPayload: {
    notBefore: 0,
    enabled: true,
    sslRequired: 'none',
    bruteForceProtected: true,
    failureFactor: 10,
    eventsEnabled: false,
    smtpServer: {
      host: process.env.HOST,
      port: process.env.PORT,
      from: process.env.FROM,
      auth: 'true',
      user: process.env.SMTP_USERNAME,
      password: process.env.SMTP_PASSWORD,
      replyTo: process.env.REPLY_TO,
      fromDisplayName: process.env.FROM_DISPLAY_NAME,
      replyToDisplayName: process.env.REPLY_TO_DISPLAY_NAME,
    },
    resetPasswordAllowed: true,
  },
};
