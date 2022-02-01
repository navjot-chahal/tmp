const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { Command } = require("selenium-webdriver/lib/command");
require("chromedriver");

const env = process.env.NODE_ENV;
// const env = "test";
const { until, Capabilities } = webdriver;

module.exports = class Page {
  static commands = {
    ADDVIRTUALAUTHENTICATOR: "AddVirtualAuthenticator",
    SETUSERVERIFIED: "SetUserVerified",
  };

  constructor(browser = "chrome") {
    if (env === "test") {
      const capabilities = Capabilities.chrome();

      // const options = new chrome.Options();
      // options.addArguments("--no-sandbox");
      // options.addArguments("--disable-dev-shm-usage");

      this.driver = new webdriver.Builder()
        // .forBrowser(browser)
        .usingServer("http://selenium:4444/wd/hub")
        // .setChromeOptions(options)
        .withCapabilities(capabilities)
        .build();
    } else {
        this.driver = new webdriver.Builder()
          .forBrowser(browser)
          .setChromeOptions(new chrome.Options().addArguments())
          .build();
        this.authenticatorId = null;
    }
  }

  async addVirtualAuthenticator() {
    const sessionId = (await this.driver.getSession()).id_;

    this.driver
      .getExecutor()
      .defineCommand(
        Page.commands.ADDVIRTUALAUTHENTICATOR,
        "POST",
        "/session/:sessionId/webauthn/authenticator"
      );

    const addVirtualAuthCommand = new Command(
      Page.commands.ADDVIRTUALAUTHENTICATOR
    );
    addVirtualAuthCommand.setParameter("sessionId", sessionId);
    addVirtualAuthCommand.setParameter("protocol", "ctap2");
    addVirtualAuthCommand.setParameter("transport", "internal");
    addVirtualAuthCommand.setParameter("hasResidentKey", true);
    addVirtualAuthCommand.setParameter("isUserConsenting", true);
    addVirtualAuthCommand.setParameter("isUserVerified", true);
    addVirtualAuthCommand.setParameter("hasUserVerification", true);

    const authenticatorId = await this.driver
      .getExecutor()
      .execute(addVirtualAuthCommand);

    this.authenticatorId = authenticatorId;

    return this.driver;
  }

  async open(url) {
    await this.driver.get(url);
  }

  async navigateTo(url) {
    await this.driver.get(url);
    await this.wait();
  }

  async close() {
    await this.driver.close();
  }

  async quit() {
    await this.driver.quit();
  }

  async waitForElement(selector) {
    await this.driver.wait(until.elementLocated(selector), 10000);
  }

  async waitForRemovedElement(selector) {
    await this.driver.wait(until.stalenessOf(selector));
  }

  async findElement(selector) {
    return await this.driver.findElement(selector);
  }

  async getAlertText() {
    await this.driver.wait(until.alertIsPresent());
    const windowHandle = await this.driver.getWindowHandle();
    const alert = await this.driver.switchTo().alert();
    const alertText = await alert.getText();
    await this.driver.switchTo().window(windowHandle);
    return alertText;
  }

  async acceptAlert() {
    await this.driver.wait(until.alertIsPresent());
    const windowHandle = await this.driver.getWindowHandle();
    const alert = await this.driver.switchTo().alert();
    await this.wait();
    const alertText = await alert.accept();
    await this.driver.switchTo().window(windowHandle);
    return alertText;
  }

  async click(selector) {
    await this.waitForElement(selector);
    await this.driver.findElement(selector).then((elm) => elm.click());
  }
  
  async type(selector, text) {
    await this.waitForElement(selector);
    await this.driver.findElement(selector).then((elm) => elm.clear());
    await this.driver.findElement(selector).then((elm) => elm.sendKeys(text));
  }
  
  async getText(selector) {
    await this.waitForElement(selector);
    return this.driver.findElement(selector).then((elm) => elm.getText());
  }

  async wait(time = 2000) {
    await this.driver.sleep(time);
  }

  async waitUntil(callback) {
    await this.driver.wait(callback);
  }
};
