const DirectWeb = require("./DirectWeb");
const Selectors = require("./selectors");

const { userElm, button } = Selectors.selectors;

module.exports = class ManagementAPI extends DirectWeb {
  users = new Map();

  async register(username) {
    const userSelector = userElm(username);
    await super.register(username);
    await this.acceptAlert();
    await this.waitForElement(userSelector);
    const elm = await this.findElement(userSelector);
    this.users.set(username, elm);
  }

  async deleteUser(username) {
    if (!this.users.has(username)) {
      throw new Error(`${username} not found`);
    }

    const user = this.users.get(username);
    const deleteButton = await user.findElement(button("Delete"));
    await deleteButton.click();
    await this.waitForRemovedElement(user);
    this.users.delete(username);
  }
};
