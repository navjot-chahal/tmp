const Page = require("./page");
const Selectors = require("./selectors");

const { button, input, id, className, option } = Selectors.selectors;

module.exports = class DirectWeb extends Page {
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

  async register(username, options = {}) {
    const { credentialName = "" } = options;
    const inputSelector = input("Username");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.type(input("Credential Name"), credentialName);
    await this.click(button("Register"));
  }

  async login(username) {
    const inputSelector = input("Username");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.click(button("Login"));
  }

  async registerWithPassword(username, password, passwordConfirm) {
    const inputSelector = input("Username");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.type(input("Password"), password);
    await this.type(input("Confirm Password"), passwordConfirm);
    await this.click(button("Register"));
  }

  async loginWithPassword(username, password) {
    const inputSelector = input("Username");
    await this.waitForElement(inputSelector);
    await this.type(inputSelector, username);
    await this.type(input("Password"), password);
    await this.click(button("Login"));
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
