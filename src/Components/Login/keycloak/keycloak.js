import Keycloak from "keycloak-js"
import { getEnv } from "utils/getEnv";

const KEYCLOAK_URL = getEnv('KEYCLOAK_URL');

const KeycloakConfig=new Keycloak({
    url: `${KEYCLOAK_URL}`,
    realm: 'guacamole',
    clientId: "lucky-client"
})

export default KeycloakConfig
