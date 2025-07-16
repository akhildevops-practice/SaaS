import Keycloak from 'keycloak-js';
import {KC_URL} from './config';
import getAppUrl from './utils/getAppUrl';

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'

const realmName = getAppUrl();
const kcAuth = new (Keycloak as any)({
  clientId:'admin-cli',
  realm : realmName,
  url:`${KC_URL}/auth`,
});

export default kcAuth;