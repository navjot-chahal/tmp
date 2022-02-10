require("dotenv").config();
const Fetch = require("./Fetch.js");
const MAILSLURP_API_KEY  = process.env.MAILSLURP_API_KEY || "5a4e1e81756289634eb22501f196d0b8357713c71e9d1b7ac04ec10c840163e7";

class MailSlurp extends Fetch {
    baseUrl = "https://api.mailslurp.com";
    headers = { "X-API-Key": MAILSLURP_API_KEY };

    async deleteAllEmails() {
        await this.delete(`${this.baseUrl}/emails`, this.headers);
    }

    async waitForLatestEmail(mailslurpInboxId) {
        let data;

        const queries = {
            timeout: "60000",
            inboxId: mailslurpInboxId,
        };

        data = await this.get(
            `${this.baseUrl}/waitForLatestEmail`,
            this.headers,
            queries
        );
        return data;
    }

  async waitForInviteLink(mailslurpInboxId) {

    const data = await this.waitForLatestEmail(mailslurpInboxId);

    const { body } = data;

    return /href="([^"]*)/.exec(body)[1].replace(/amp;/g, '');
  }

  async waitForCodeRecovery(mailslurpInboxId) {
    const data = await this.waitForLatestEmail(mailslurpInboxId);
    const { body } = data;

    const url = /href="([^"]*)/.exec(body)[1];
    const splitUrl = url.split("/");
    const passwordRecoveryCode = splitUrl[splitUrl.length - 1];

    return passwordRecoveryCode;
  }

  async createInbox() {
    const data = await this.post(
      `${this.baseUrl}/inboxes`,
      {},
      this.headers
    );
    return data;
  }

  async deleteInbox(mailboxId) {
    await this.delete(`${this.baseUrl}/inboxes/${mailboxId}`, this.headers);
  }
}

module.exports = MailSlurp;
