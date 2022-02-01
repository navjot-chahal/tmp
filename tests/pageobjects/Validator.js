const { expect } = require("chai");
const { decode } = require("jsonwebtoken");

const registerProps = (clientId, username) => ({
  is_authenticated: true,
  client: {
    id: clientId,
    type: "directweb",
    rp_id: "directwebtest.herokuapp.com",
  },
  user: {
    id: null,
    username,
    namespace_id: null,
    type: "regular",
  },
  credential: {
    uuid: null,
    name: null,
    type: "fido2",
  },
  jwt: null,
});

const registerPropsFIDO2 = (clientId, username) => ({
  ...registerProps(clientId, username),
  fido2: {
    aaguid: null,
    public_key: null,
    user_presence: true,
    user_verified: true,
  },
});

const loginPropsFIDO2 = (clientId, username) => ({
  ...registerPropsFIDO2(clientId, username),
});

const txCreateConfirmProps = { jwt: null, success: true };

const registerPasswordProps = (clientId, username) => ({
  ...registerProps(clientId, username),
  credential: {
    uuid: null,
    name: null,
    type: "password",
  },
});

const loginPasswordProps = (clientId, username) => ({
  ...registerPasswordProps(clientId, username),
});

const payloadProps = (clientId) => ({
  iss: "loginid.io",
  sub: null,
  sid: null,
  nid: null,
  aud: clientId,
  iat: null,
});

const registerPayload = (action, clientId, username) => ({
  ...payloadProps(clientId),
  action,
  udata: username,
});

const txPayload = (action, clientId, username) => ({
  ...payloadProps(clientId),
  action,
  username,
  nonce: null,
  tx_hash: null,
  server_nonce: null,
});

const checkProperties = (props, result) => {
  const expectedEntries = Object.entries(props);
  const resultEntries = Object.entries(result);

  if (expectedEntries.length !== resultEntries.length) {
    console.log(expectedEntries);
    console.log(resultEntries);
  }
  expect(expectedEntries).to.have.lengthOf(resultEntries.length);

  expectedEntries.forEach(([key, value]) => {
    if (value === null) {
      expect(result).to.have.property(key);
    } else if (typeof value === "object") {
      checkProperties(props[key], result[key]);
    } else {
      expect(result).to.have.property(key, value);
    }
  });
};

const checkPayload = (props, result) => {
  checkProperties(props, decode(result.jwt));
};

const register = (result, clientId, username, credentialName) => {
  checkProperties(registerPropsFIDO2(clientId, username), result);
  checkPayload(registerPayload("register", clientId, username), result);
  if (credentialName) {
    expect(result.credential).to.have.property("name", credentialName);
  }
};

const login = (result, clientId, username) => {
  checkProperties(loginPropsFIDO2(clientId, username), result);
  checkPayload(registerPayload("login", clientId, username), result);
};

const registerPassword = (result, clientId, username) => {
  checkProperties(registerPasswordProps(clientId, username), result);
  checkPayload(registerPayload("register", clientId, username), result);
};

const loginPassword = (result, clientId, username) => {
  checkProperties(loginPasswordProps(clientId, username), result);
  checkPayload(registerPayload("login", clientId, username), result);
};

const txCreateConfirm = (result, clientId, username) => {
  checkProperties(txCreateConfirmProps, result);
  checkPayload(txPayload("tx_confirmation", clientId, username), result);
};

module.exports = {
  register,
  login,
  txCreateConfirm,
  registerPassword,
  loginPassword,
};
