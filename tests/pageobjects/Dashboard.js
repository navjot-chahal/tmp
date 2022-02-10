require("dotenv").config();
const Page = require("./page");
const Selectors = require("./selectors");
const { randomPick } = require("../utils/random");
const { button, input, id, className, option, contains, buttonContains, spanButton, exact, listContains, classButton } = Selectors.selectors;

const environment = process.env.LOGINID_ENV || "qa";
const dashboardHomeURL = `https://${environment}.loginid.io/en/application`;
const registerToLoginDelay = 1000;

// Hardcoded HTML elements selector
const NextButton = `//*[@id="app"]/div/div/div/div/div/form/div[2]/button`;
const LoginButton = `//*[@id="app"]/div/div/div/div/div/form/div[2]/div/div/button[1]`;
const LogoutDropdown = `//*[@id="app"]/div/div[2]/div/div/div/header/div[3]/div/div[1]`;
const LogoutButton = `//*[@id="app"]/div/div[2]/div/div/div/header/div[3]/div/div[2]/ul/li[2]`;
const AddDeviceCode  = `//*[@id="app"]/div/div/div/p`;

module.exports = class Dashboard extends Page {
  constructor() {
    super();
  }

  async configure(apiKey, baseUri) {
    await this.type(input("Client ID"), apiKey);
    await this.type(input("Base URI"), baseUri);
    await this.click(button("Configure"));
  }

  async enterPrivateKey(pkey) {
    await this.type(id("pkey"), pkey);
  }

  async enterMangement(clientId) {
    await this.type(id("management_clientId"), clientId);
  }

  async addVirtualAuthenticator(roamingAuthenticator = false) {
    if (roamingAuthenticator) {
      const roamingTypes = ["usb", "ble", "nfc"];
      await super.addVirtualAuthenticator(randomPick(roamingTypes));
      await super.addVirtualAuthenticator("ble");
      return;
    }

    await super.addVirtualAuthenticator("internal");
  }

  async registerFido2(username, roamingAuthenticator = false) {
    const inputSelector = input("Email");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.click({xpath: NextButton});
    if (roamingAuthenticator) {
      await this.click(contains("Use external key"));
    } else {
      await this.click(contains("Use my device"));
    }
    // Logout
    await this.click({xpath: LogoutDropdown});
    await this.click({xpath: LogoutButton});    
    await this.waitForElement({xpath: NextButton});
    await this.wait(registerToLoginDelay);
  }
  
  async registerSuperAdminFido2(username) {
    const inputSelector = input("Email");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.click({xpath: NextButton});
    await this.click(contains("Use my device"));
    await this.click({xpath: LogoutDropdown});
  }
  
  async loginFido2(username) {
    const inputSelector = input("Email");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.click({xpath: NextButton});
    await this.click({xpath: LoginButton});
    await this.waitForElement({xpath: LogoutDropdown});
  }
  
  async registerWithPassword(username, password) {
    const inputSelector = input("Email");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.click(exact("Next"));
    await this.click(contains("Use password instead"));
    await this.type(input("Enter password"), password);
    await this.type(input("Confirm password"), password);
    await this.click(exact(" Register "));
    // Logout
    await this.click({xpath: LogoutDropdown});
    await this.click({xpath: LogoutButton});    
    await this.waitForElement({xpath: NextButton});
    await this.wait(registerToLoginDelay);
  }

  async loginWithPassword(username, password) {
    const inputSelector = input("Email");
    await this.type(inputSelector, username);
    await this.click(exact("Next"));
    await this.click(contains("Use password instead"));
    await this.type(input("Enter password"), password);
    await this.click(exact("Login"));
    await this.waitForElement({xpath: LogoutDropdown});
  }

  async addCredential(username, code, options = {}) {
    const { credentialName = "" } = options;
    await this.waitForElement(id("code"));
    await this.type(input("Username"), username);
    await this.type(input("Code"), code);
    await this.type(input("Credential Name"), credentialName);
    await this.click(option("type", "short"));
    await this.click(button("Add Credential"));
  }

  async inviteAdmin(inviteEmail, adminType) {
    await this.click(spanButton("Admin Management"));
    await this.click(buttonContains("Add Admin"));
    await this.type(input("New Administrator Email"), inviteEmail);
    await this.type(input("Confirm Email"), inviteEmail);
    await this.click(contains("Select an Admin Role"));
    if (adminType === "superAdmin") {
      await this.click(listContains("Super Admin"));
    } else if (adminType === "intermediateAdmin") {
      await this.click(listContains("Intermediate Admin"));
    } else if(adminType === "internalAdmin") {
      await this.click(listContains("Internal Admin"));
    };
    await this.click(buttonContains("Invite"));
    await this.waitForElement(contains("Email Sent!"));

    await this.wait(registerToLoginDelay);
    return await this.getText(className("code"))
  }

  async addAdmin(inviteOTP, authenType, password) {
    await this.type(input("Access code"), inviteOTP);
    await this.click(buttonContains("Next"));
    if (authenType === "FIDO2") {
      await this.click(contains("Use my device"));
    } else if (authenType === "password") {
      await this.click(contains("Use password instead"));
      await this.type(input("Enter password"), password);
      await this.type(input("Confirm password"), password);
      await this.click(exact(" Register "));
    };
    // Logout
    await this.click({xpath: LogoutDropdown});
    await this.click({xpath: LogoutButton});    
    await this.waitForElement({xpath: NextButton});
    await this.wait(registerToLoginDelay);
  }

  async logOut() {
    await this.navigateTo(dashboardHomeURL);
    // Logout
    await this.click({xpath: LogoutDropdown});
    await this.click({xpath: LogoutButton});    
    await this.waitForElement({xpath: NextButton});
    await this.wait(registerToLoginDelay);
  }

  async deleteAdmin() {
    await this.click(contains("Admin Management"));
    await this.click(className("dropdown-root"));
    await this.wait(500);
    await this.click(buttonContains("Delete"));
    await this.click(classButton("modal-container", "Delete"));
    await this.navigateTo(dashboardHomeURL);
  }

  async getDeviceCode() {
    return this.getText({xpath: AddDeviceCode});
  }

  async registerWithCode(username, code) {
    const inputSelector = input("Email");
    await this.type(inputSelector, username);
    await this.click(exact("Next"));
    await this.click(contains("Add new device"));
    // Enter Device Code
    await this.type(input("XXXXXX"), code);
    await this.click(exact("Add device"));
    await this.waitForElement({xpath: LogoutDropdown});
  }
};
