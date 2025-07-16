interface IConnectedAppsSchema {
  id: string;
  appName: string;
  status: boolean;
  baseUrl: string;
  redirectUrl: string;
  grantType: string;
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
  locations: string[];
  description: string;
  lastModifiedTime: Date | null;
  lastModifiedUser: string;
}

export const connectedAppsSchema: IConnectedAppsSchema = {
  id: "",
  appName: "",
  status: false,
  baseUrl: "",
  redirectUrl: "",
  grantType: "client",
  username: "",
  password: "",
  clientId: "",
  clientSecret: "",
  locations: [],
  description: "",
  lastModifiedTime: null,
  lastModifiedUser: "",
};
