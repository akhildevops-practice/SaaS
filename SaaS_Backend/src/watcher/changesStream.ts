import axios from 'axios';
import { MongoClient } from 'mongodb';
import qs from 'qs';

let client;

// Function to generate OAuth token
const generateOAuthToken = async (app) => {
  try {
    const decodedusername = Buffer.from(app.user, 'base64').toString('ascii');
    const decodedpassword = Buffer.from(app.password, 'base64').toString(
      'ascii',
    );
    const requestBody = qs.stringify({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: decodedusername,
      password: decodedpassword,
    });

    const response = await axios.post(app.baseURL, requestBody, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.status === 200 ? response.data.access_token : null;
  } catch (error) {
    console.error('Error generating OAuth token:', error);
    return null;
  }
};

// Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class WatcherManager {
  static watchers = new Map(); // Map to hold active watchers per collection

  static async getWatcher(db, collectionName, auditTrailCallback) {
    if (WatcherManager.watchers.has(collectionName)) {
      // Return existing watcher if already running
      return WatcherManager.watchers.get(collectionName);
    }

    // Create a new watcher
    const changeStream = db.collection(collectionName).watch(
      [
        {
          $match: { operationType: { $in: ['insert', 'update', 'delete'] } },
        },
      ],
      {
        fullDocument: 'updateLookup',
        fullDocumentBeforeChange: 'whenAvailable',
      },
    );

    // Handle changes
    const processedIds = new Set();
    changeStream.on('change', async (change) => {
      const documentId = change.documentKey._id.toString();
      if (!processedIds.has(documentId)) {
        processedIds.add(documentId);
        try {
          await auditTrailCallback(change);
        } catch (error) {
          console.error('Error processing change:', error);
        } finally {
          processedIds.delete(documentId); // Allow reprocessing if necessary
        }
      }
    });

    changeStream.on('error', (err) => {
      console.error('Change stream error:', err);
      WatcherManager.watchers.delete(collectionName); // Clean up on error
    });

    WatcherManager.watchers.set(collectionName, changeStream);
    return changeStream;
  }
}

// Main audit trail function
// const auditTrail = async (
//   collection,
//   module,
//   subModule,
//   user,
//   userId,
//   randomNumber,
// ) => {
//try {
// client = await new MongoClient(process.env.MONGO_DB_URI1);
// const db = client.db(process.env.MONGO_DB_NAME);

// const handleChange = async (change) => {
//   if (
//     change.operationType === 'insert' ||
//     change.operationType === 'update'
//   ) {
//     const updatedDoc = await db
//       .collection(collection)
//       .findOne({ _id: change.documentKey._id });

// if (
//   collection === 'kpireportinstances' &&
//   updatedDoc.reportStatus === 'SUBMIT'
// ) {
//   const url = `${process.env.SERVER_IP}/api/kpi-report/writeToSummary?organizationId=${updatedDoc.organization}`;
//   await delay(1000);
//   try {
//     const response = await axios.get(url);
//     console.log('KPI API call successful', response.data);
//   } catch (error) {
//     console.log('Error:', error.message);
//   }
// }
//}
//};

// await WatcherManager.getWatcher(db, collection, handleChange);
// } catch (error) {
//   console.error('Error starting audit trail:', error);
// }
// };

const auditTrail = async (
  collection,
  module,
  subModule,
  user,
  userId,
  randomNumber,
) => {
  const client = new MongoClient(process.env.MONGO_DB_URI1);
  await client.connect();
  const dbname = process.env.MONGO_DB_URI.split('/');
  const db = client.db(dbname[dbname.length - 1]);
  const changeStream = db
    .collection(collection)
    .watch(
      [{ $match: { operationType: { $in: ['insert', 'update', 'delete'] } } }],
      {
        fullDocument: 'updateLookup',
        fullDocumentBeforeChange: 'whenAvailable',
      },
    );

  changeStream.on('change', async (change: any) => {
    if (
      change.operationType === 'insert' ||
      change.operationType === 'update'
    ) {
      const beforeState = {};
      const afterState = {};
      if (change.operationType === 'update') {
        const updatedFields = Object.keys(
          change.updateDescription.updatedFields,
        );
        if (updatedFields.length === 1 && updatedFields[0] === 'updatedAt') {
          changeStream.close();
          client.close();
          return;
        }
        for (const key in change.updateDescription.updatedFields) {
          if (key === 'updatedAt') continue;
          if (change.fullDocumentBeforeChange.hasOwnProperty(key)) {
            beforeState[key] = change.fullDocumentBeforeChange[key];
          }
        }
        for (const key in change.updateDescription.updatedFields) {
          if (key === 'updatedAt') continue;
          if (change.fullDocument.hasOwnProperty(key)) {
            afterState[key] = change.fullDocument[key];
          }
        }
      }
      const userToken = user.kcToken;
      const formData = {
        organizationId: userId.organizationId,
        timestamp: new Date(),
        responsibleUser: userId.id,
        actionType: change.operationType,
        module: module,
        subModule: subModule,
        subModuleId: change.fullDocument._id,
        beforeState: beforeState,
        afterState: afterState,
      };
      changeStream.close();
      client.close();

      setTimeout(async () => {
        try {
          const response = await axios.post(
            `${process.env.SERVER_IP}/api/audit-trial/createAuditTrail`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
                'Content-Type': 'application/json',
              },
            },
          );
        } catch (error) {
          console.error('Error making API call:', error.message);
        }
      }, 5000);
    }

    if (change.operationType === 'delete') {
      const afterState = {};
      const userToken = user.kcToken;
      const formData = {
        organizationId: userId.organizationId,
        timestamp: new Date(),
        responsibleUser: userId.id,
        actionType: change.operationType,
        module: module,
        subModule: subModule,
        subModuleId: change.fullDocumentBeforeChange._id,
        beforeState: change.fullDocumentBeforeChange,
        afterState: afterState,
      };

      changeStream.close();
      client.close();

      setTimeout(async () => {
        try {
          const response = await axios.post(
            `${process.env.SERVER_IP}/api/audit-trial/createAuditTrail`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
                'Content-Type': 'application/json',
              },
            },
          );
        } catch (error) {
          console.error('Error making API call:', error.message);
        }
      }, 5000);
    }
  });
};

export default auditTrail;
