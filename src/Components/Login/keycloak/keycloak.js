import Keycloak from "keycloak-js";
import { getEnv } from "utils/getEnv";

const KEYCLOAK_URL = getEnv("KEYCLOAK_URL");

const KeycloakConfig = new Keycloak({
  url: `${KEYCLOAK_URL}`,
  realm: "guacamole",
<<<<<<< HEAD
  // clientId: "react-client",
  clientId: "lucky",
=======
  clientId: "react-client",
  // clientId: "lucky-client",
>>>>>>> f15918c2c264fe0a6eb85627df970ca5124ce452
});

export default KeycloakConfig;
