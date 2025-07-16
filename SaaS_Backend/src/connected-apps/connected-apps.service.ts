import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

import { PrismaService } from 'src/prisma.service';
import { ObjectStore } from 'src/object-store/schema/object-store.schema';
import { Google } from 'src/google/schema/google.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
// import oauth from 'axios-oauth-client';
const bcrypt = require('bcrypt');
const saltRounds = 10;

@Injectable()
export class ConnectedAppsService {
  constructor(
    private prisma: PrismaService,
    @InjectModel(ObjectStore.name)
    private ObjectStoreModel: Model<ObjectStore>,
    @InjectModel(Google.name)
    private GoogleModel: Model<Google>,
  ) {}
  //this api is used to create a new connected app
  async createConnectedApp(userid, data) {
    // try {
    const {
      sourceName,
      clientId,
      clientSecret,
      Status,
      baseURL,
      description,
      user,
      password,
      locationId,
      redirectURL,
      grantType,
    } = data;
    // console.log('data', data);
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userid },
    }); //get the logged-in user
    // const hashedSecret = await bcrypt.hash(clientSecret, saltRounds)//hash the clientsecret and store it in a temp var
    const encodedClientSecret = Buffer.from(clientSecret).toString('base64');
    const encodedusername = Buffer.from(user).toString('base64');
    const encodedpassword = Buffer.from(password).toString('base64');

    // const hashedClientId = await bcrypt.hash(clientId, saltRounds)//hash the clientid and store in a var
    const result = await this.prisma.connectedApps.create({
      data: {
        sourceName,
        clientId,
        clientSecret: encodedClientSecret,
        createdModifiedBy: activeUser.username,
        organizationId: activeUser.organizationId,
        Status,
        baseURL,
        description,
        user: encodedusername,
        password: encodedpassword,
        locationId,
        redirectURL,
        grantType,
      },
    });
    return result;
    // } catch (error) {
    //   throw new NotFoundException(error.message);
    // }
  }
  //this api is used to get all connected apps which are active
  async getAllConnectedApps(userid) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });
      const result = await this.prisma.connectedApps.findMany({
        where: { organizationId: activeUser.organizationId },
      });
      const objectStore = await this.ObjectStoreModel.findOne({
        organizationId: activeUser.organizationId,
      });
      const google = await this.GoogleModel.findOne({
        organizationId: activeUser.organizationId,
      });
      let finalResult = [...result];
      let objStoreDataFormat;
      let googleDataFormat;
      if (objectStore) {
        objStoreDataFormat = {
          id: objectStore._id,
          sourceName: 'Object Store',
          grantType: 'objectStore',
        };
        finalResult.push(objStoreDataFormat);
      }
      if (google) {
        googleDataFormat = {
          id: google._id,
          sourceName: 'Google',
          grantType: 'google',
        };
        finalResult.push(googleDataFormat);
      }
      return finalResult;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getConnectedAppByName(data, userid) {
    try {
      const { name } = data;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });
      const result = await this.prisma.connectedApps.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          sourceName: name,
        },
      });
      return result;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  //this api is used to delete a selected connected app
  async deleteConnectedApp(userid, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });
      const result = await this.prisma.connectedApps.delete({ where: { id } });
      return result;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  //this api is used to fetch the details of a selected connected app
  async getSelectedConnectedApp(id) {
    try {
      //const activeUser = await this.prisma.user.findFirst({ where: { kcId: userid } })
      const result = await this.prisma.connectedApps.findUnique({
        where: { id },
      });
      return result;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  //this api is used to update a slected connected app by using its id
  async updateselectedconnectedapp(data, userid, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userid },
      });
      const {
        clientId,
        clientSecret,
        Status,
        baseURL,
        description,
        user,
        password,
        redirectURL,
        locationId,
      } = data;
      const encodedClientSecret = Buffer.from(clientSecret).toString('base64');
      // ////////////////console.log("encoded value", encodedClientSecret)
      const encodedusername = Buffer.from(user).toString('base64');
      const encodedpassword = Buffer.from(password).toString('base64');
      //  ////////////////console.log(Buffer.from(encodedClientSecret, 'base64').toString('ascii'))
      const result = await this.prisma.connectedApps.update({
        where: { id },
        data: {
          clientId,
          clientSecret: encodedClientSecret,
          Status,
          baseURL,
          description,
          user: encodedusername,
          password: encodedpassword,
          redirectURL,
          locationId,
        },
      });
      return result;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async testConnectedApp(userid, id, res) {
    let flag = false;

    const bodydata = await this.getSelectedConnectedApp(id);
    const decodedclientsecret = Buffer.from(
      bodydata.clientSecret,
      'base64',
    ).toString('ascii');
    const decodedusername = Buffer.from(bodydata.user, 'base64').toString(
      'ascii',
    );
    const decodedpassword = Buffer.from(bodydata.password, 'base64').toString(
      'ascii',
    );

    var jsforce = require('jsforce');
    var conn = new jsforce.Connection({
      oauth2: {
        loginUrl: bodydata.baseURL,
        clientId: bodydata.clientId,
        clientSecret: decodedclientsecret,
        redirectUri: bodydata.redirectURL,
      },
    });

    try {
      await conn.login(
        decodedusername,
        decodedpassword + 'ij8otpnj7hMGK4O17bRBgcVRP',
        async function (err, userInfo) {
          if (conn.accessToken) {
            flag = true;
            return res.send(true);
          } else {
            flag = false;
            return res.send(false);
          }
        },
      );
    } catch {
      flag = false;
    }
    await this.updateAppStatus(id, flag);
  }

  async updateAppStatus(id, appStatus) {
    await this.prisma.connectedApps.update({
      where: {
        id,
      },
      data: {
        Status: appStatus,
      },
    });
  }
  async connectionTypeAxelor(id) {
    const axios = require('axios');
    const setCookieParser = require('set-cookie-parser');
    let flag = false;
    const bodydata = await this.getSelectedConnectedApp(id);
    const decodedusername = Buffer.from(bodydata.user, 'base64').toString(
      'ascii',
    );
    // ////////////////console.log('uname', decodedusername);
    const decodedpassword = Buffer.from(bodydata.password, 'base64').toString(
      'ascii',
    );
    //////////////////console.log('pwd', bodydata.baseURL);
    const jid = await axios
      .post(
        bodydata.baseURL,
        {
          username: decodedusername, //gave the values directly for testing
          password: decodedpassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then((response) => {
        // ////////////////console.log('response', response.headers['set-cookie']);
        // ////////////////console.log('Authentication successful');
        flag = true;
        let cookies = setCookieParser.parse(response.headers['set-cookie']);
        let jsessionId = cookies.find((c) => c.name === 'JSESSIONID').value;
        // ////////////////console.log(`JSESSIONID: ${jsessionId}`);
        return jsessionId;
      })
      .catch((error) => {
        ////////////////console.log('Authentication failed');
        flag = false;
        // return error.send(false);
      });
    await this.updateAppStatus(id, flag);
    // ////////////////console.log('cookies');
    // ////////////////console.log('jid', jid);
    return jid;
  }
  async axelorEndPoint(query) {
    const { jid, url } = query;
    //const auth = await this.testconnectionusingaxios(id);
    // const baseurl = await this.getSelectedConnectedApp(id);
    const data = await axios
      .get(
        url,
        // 'http://prodlelabs.com:8082/ws/rest/com.axelor.apps.fleet.db.VehicleCost',
        {
          headers: {
            Cookie: 'JSESSIONID=' + jid,
          },
        },
      )
      .then((response) => {
        // ////////////////console.log('inside response');
        // ////////////////console.log(response.data.data[0].date);
        const data = response.data;
        // ////////////////console.log('typeof', typeof data);
        // const stringdata = JSON.stringify(data);
        // ////////////////console.log('string data', stringdata);
        // const validJson = stringdata.replace(
        //   /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
        //   '"$2": ',
        // );
        //const modifiedjson = JSON.parse(validJson);
        //  ////////////////console.log('totalprice', response.data);

        // ////////////////console.log(validJson);
        return response.data;
      })
      .catch((error) => {
        console.error(error);
      });
    // ////////////////console.log('data from axiosget', data);
    return data;
  }
}
