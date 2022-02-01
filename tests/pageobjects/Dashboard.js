const Page = require("./page");
const Selectors = require("./selectors");

const { button, buttonContains, input, id, className, option, contains, exact } = Selectors.selectors;

// Hardcoded HTML elements selector
// Fido2 flow
const NextButton = `//*[@id="app"]/div/div/div/div/div/form/div[2]/button`;
const LoginButton = `//*[@id="app"]/div/div/div/div/div/form/div[2]/div/div/button[1]`;
const LogoutDropdown = `//*[@id="app"]/div/div[2]/div/div/div/header/div[3]/div/div[1]`;
const LogoutButton = `//*[@id="app"]/div/div[2]/div/div/div/header/div[3]/div/div[2]/ul/li[2]`;
// Add Device Flow
const AddDeviceCode = `//*[@id="app"]/div/div/div/p`;
const UsePasswordButton =  `//*[@id="app"]/div/div/div/div/div/form/div[2]/div/div/button[3]`;

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

  async registerFido2(username, options = {}) {
    const inputSelector = input("Email");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.click({xpath: NextButton});
    await this.click({xpath: LoginButton});
    // Logout
    await this.click({xpath: LogoutDropdown});
    await this.click({xpath: LogoutButton});    
    await this.waitForElement({xpath: NextButton});
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
    await this.click(buttonContains("Next"));

    await this.click(buttonContains("Use password instead"));
    await this.type(input("Enter password"), password);
    await this.type(input("Confirm password"), password);
    await this.click(buttonContains("Register"));
    // Logout
    await this.click({xpath: LogoutDropdown});
    await this.click({xpath: LogoutButton});    
    await this.waitForElement({xpath: NextButton});
  }

  async loginWithPassword(username, password) {
    const inputSelector = input("Email");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.click(buttonContains("Next"));
    await this.click(buttonContains("Use password instead"));
    await this.type(input("Enter password"), password);
    await this.click(buttonContains("Login"));
    await this.waitForElement({xpath: LogoutDropdown});
  }
  
  async getDeviceCode() {
    return await this.getText({xpath: AddDeviceCode});
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

  async createTx(username, payload) {
    await this.type(input("Username"), username);
    await this.type(input("Transaction Payload"), payload);
    await this.click(button("Create and Confirm Transaction"));
  }

  async confirmTx(username, payload) {
    const transactionTokenSelector = className("transaction_token");
    const usernameField = input("Username");

    await this.type(usernameField, username);
    await this.type(input("Transaction Payload"), payload);
    await this.click(button("Create Transaction"));
    await this.waitForElement(transactionTokenSelector);
    const identity = await this.getText(transactionTokenSelector);
    await this.driver.sleep(2000);
    await this.type(usernameField, username);
    await this.type(input("Transaction ID"), identity);
    await this.click(button("Confirm Transaction"));
  }

  async createCode(username) {
    const codeSelector = id("code");
    await this.waitForElement(codeSelector);
    await this.type(input("Username"), username);
    await this.click(option("type", "short"));
    await this.click(option("purpose", "add_credential"));
    await this.click(option("bool", "yes"));
    await this.click(button("Create Code"));
    await this.waitUntil(async () => {
      return (await this.getText(codeSelector)).length > 0;
    });
    return await this.getText(codeSelector);
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
};
