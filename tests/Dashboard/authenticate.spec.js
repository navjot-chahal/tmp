require("dotenv").config();
// const { expect } = require("chai");
const Jabber = require("jabber");
const { markAsUntransferable } = require("worker_threads");
const Dashboard = require("../pageobjects/Dashboard");

const registerURL = "https://qa.loginid.io/en/register";
const loginURL = "https://qa.loginid.io/en/login";

const jabber = new Jabber();
const createLoginIdEmail = () => jabber.createEmail("example.com");
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
    await dashboard.driver.manage().window().fullscreen()
  });
  
  it("Should successfully Register a fido2 user", async () => {
    // Register a Dashboard user
    await dashboard.registerFido2(username);
  });

  it("Should successfully Login a fido2 Dashboard user", async () => {
    await dashboard.loginFido2(username);
  });

  after(async () => {
    await dashboard.quit();
  });
});

describe("Register and Authenticate with Password", () => {

  before(async () => {
    dashboard2 = new Dashboard();
    await dashboard2.addVirtualAuthenticator();
    await dashboard2.open(registerURL);
    // await dashboard2.driver.manage().window().fullscreen()
  });

  it("Should successfully register a user with password", async () => {
    // Register Dashboard user with password
    await dashboard2.registerWithPassword(username2, password);
  });
  
  it("Should successfully Login Dashboard user with password", async () => {
    // Login Dashboard user with password
    await dashboard2.loginWithPassword(username2, password);
  });

  // after(async () => {
  //   await dashboard2.close();
  // });
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
    // await dashboard2.driver.manage().window().fullscreen()
    await dashboard2.registerWithCode(username2, AddDeviceCode);
  });
  after(async () => {
    await dashboard2.close();
  });
});