require("dotenv").config();
// const { expect } = require("chai");
const Jabber = require("jabber");
const Dashboard = require("./tests/pageobjects/Dashboard");
// const validator = require("../pageobjects/Validator");
// const Integraions = require("../../scripts/integrations");
// const { deleteUserByName } = require("../../services/native");
// const Messages = require("../pageobjects/messages");

// const URL = process.env.TEST_URL;
const URL = "https://qa.loginid.io/en/register";
// const dashboardUsername = process.env.DASHBOARD_USERNAME;
// const dashboardPassword = process.env.DASHBOARD_PASSWORD;
// const dashboardBaseURL = process.env.DASHBOARD_BASE_URL;
// const privateKey = process.env.TEST_PRIVATE_KEY?.replace(/\\n/g, "\n");
// const credentialId = process.env.TEST_KEY_ID;

const jabber = new Jabber();
const createLoginIdEmail = () => jabber.createEmail("loginid");
// const username = createLoginIdEmail();
const username = "myemail@gmail.com";
const username1 = createLoginIdEmail();
const username2 = createLoginIdEmail();
const username2Password = "Qwerty!1";

// const integrations = new Integraions(
//   dashboardUsername,
//   dashboardPassword,
//   dashboardBaseURL
// );


let dashboard;
let directweb1;
let clientId = "";
let baseUri = "";
let backendClientId = "";
let pkey = "";
let managementEnv = {};

(async function Test () {


  dashboard = new Dashboard();
  await dashboard.addVirtualAuthenticator();
  await dashboard.open(URL);

  console.log("Before");
  




  // let options = new chrome.Options();
  // let driver = await new webDriver.Builder()
  //   .forBrowser('chrome')
  //   .setChromeOptions(options)
  //   .build();

  // await driver.get('https://www.google.com');
  
  // console.log("The Title of the Page is:", await driver.getTitle()) // => "Google"
  
  // // Wait for page loading (Hard wait)
  // await driver.manage().setTimeouts( { implicit: 1000 } );
  
  // // Locate the elements of interest.
  // let searchBox = await driver.findElement(webDriver.By.name('q'));
  // let searchButton = await driver.findElement(webDriver.By.name('btnK'));
  
  // // Search "Selenium" in searchBox
  // await searchBox.sendKeys('Selenium');
  // await searchButton.click();


  
  
  
  // await driver.manage().setTimeouts({implicit: 10000 });
  
  // await driver.quit();
})();