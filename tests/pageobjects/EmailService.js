const MailSlurpService = require("mailslurp-client").default;

class MailSlurp {
  constructor(apiKey, inboxId, email) {
    this.mailSlurp = new MailSlurpService({ apiKey });
    this.inboxId = inboxId;
    this.email = email;
  }

  async obtainLatestEmailLink() {
    try {
      const { body } = await this.mailSlurp.waitForLatestEmail(this.inboxId);
      await this.mailSlurp.emailController.deleteAllEmails();
      return /href="([^"]*)/.exec(body)[1];
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

module.exports = MailSlurp;
