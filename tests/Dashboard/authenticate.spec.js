require("dotenv").config();
const Jabber = require("jabber");
const Dashboard = require("../pageobjects/Dashboard");

const environment = process.env.LOGINID_ENV || "qa";
const registerURL = `https://${environment}.loginid.io/en/register`;
const loginURL = `https://${environment}.loginid.io/en/login`;

const jabber = new Jabber();
const createLoginIdEmail = () => jabber.createEmail("example.com");
const usernameRemote =  `${Date.now()}` + createLoginIdEmail();
const username2 =  `${Date.now()}` + createLoginIdEmail();
const username =  `${Date.now()}` + createLoginIdEmail();
const password = "Qwerty1!";

let dashboard;
let dashboard2;

describe("Register and Authenticate with FIDO2", () => {
  console.log("Generated username is:", username2)
  before(async () => {
    dashboard = new Dashboard();
    await dashboard.addVirtualAuthenticator();
    await dashboard.open(registerURL);
  });
  
  it("Should successfully Register a fido2 user", async () => {
    // Register a Dashboard user
    await dashboard.registerFido2(username);
  });

  it("Should successfully Login a fido2 Dashboard user", async () => {
    await dashboard.loginFido2(username);
  });

  after(async () => {
    await dashboard.close();
  });
});

describe("Register and Authenticate with FIDO2 Remote Authenticator", () => {

  before(async () => {
    dashboard = new Dashboard();
    await dashboard.addVirtualAuthenticator();
    await dashboard.addVirtualAuthenticator(true);
    await dashboard.open(registerURL);
  });

  it("Should successfully register a user with password", async () => {
    // Register Dashboard user with password
    await dashboard.registerFido2(usernameRemote, true);
  });
  
  it("Should successfully Login Dashboard user with password", async () => {
    // Login Dashboard user with password
    await dashboard.loginFido2(usernameRemote);
  });

  after(async () => {
    await dashboard.close();
  });
});

describe("Register and Authenticate with Password", () => {

  before(async () => {
    dashboard2 = new Dashboard();
    await dashboard2.open(registerURL);
  });

  it("Should successfully register a user with password", async () => {
    // Register Dashboard user with password
    await dashboard2.registerWithPassword(username2, password);
  });
  
  it("Should successfully Login Dashboard user with password", async () => {
    // Login Dashboard user with password
    await dashboard2.loginWithPassword(username2, password);
  });
});

describe("Add new Device to the Password Dashboard user", async () => {

  let AddDeviceCode = '';

  before(async () => {
    await dashboard2.navigateTo("https://qa.loginid.io/code");
  });
  
  it("Should generate the 'Add Device Code'", async () => {
    // Get the Add device code
    AddDeviceCode = await dashboard2.getDeviceCode();
    await dashboard2.close();
  });
  
  it("Should register the new device with Code", async () => {
    dashboard2 = new Dashboard();;
    await dashboard2.addVirtualAuthenticator();
    await dashboard2.open(loginURL)
    await dashboard2.registerWithCode(username2, AddDeviceCode);
  });
  after(async () => {
    await dashboard2.close();
  });
});
