require("dotenv").config();
const { expect } = require("chai");
const Jabber = require("jabber");
const Dashboard = require("../pageobjects/Dashboard");
const MailSlurp = require("../utils/MailSlup");

const environment = process.env.LOGINID_ENV || "qa";
const registerURL = `https://${environment}.loginid.io/en/register`;
const loginURL = `https://${environment}.loginid.io/en/login`;

const jabber = new Jabber();
const createLoginIdEmail = () => jabber.createEmail("example.com");
const username =  `${Date.now()}` + createLoginIdEmail();
const password = "Qwerty1!";

const mailslurp = new MailSlurp();
let dashboard;
let dashboard2;

describe("Test for Admin Invites", () => {
    const testCases = [];
    let inviteCodeOTP = "";
    let acceptLink = "";
    let inbox;

    adminTypes = ["superAdmin", "intermediateAdmin", "internalAdmin"];
    authenticationTypes = ["FIDO2", "password"];

    // Filling up testCases array
    adminTypes.forEach((adminType) => {
        authenticationTypes.forEach((authenticationType) => {
            const test = {
                admin: adminType,
                authen: authenticationType,
            };
            testCases.push(test);
        });
    });

    // Setup and intialize two separate chrome windows
    before(async () => {
        dashboard = new Dashboard();
        dashboard2 = new Dashboard();
        await dashboard.addVirtualAuthenticator();
        await dashboard2.addVirtualAuthenticator();
        await dashboard.open(registerURL);
        // Register a Super Admin for the whole test suite
        await dashboard.registerSuperAdminFido2(username);
    });
    
    testCases.forEach(async (testCase) => {
        describe(`New Test Case for ${testCase.admin}`, () => {

            // Create a new mailslurp mailbox for each test suite
            it("Should create mailslurp inbox", async () => {
                console.log("Adding new inbox");
                inbox = await mailslurp.createInbox();
                expect(inbox).ownProperty("emailAddress");
                expect(inbox).ownProperty("id");
            });

            // Get the admin invite OTP
            it(`Should invite one ${testCase.admin}`, async () => {
                inviteCodeOTP = await dashboard.inviteAdmin(inbox.emailAddress, testCase.admin);
                console.log("Invite Code is:", inviteCodeOTP);
                expect(inviteCodeOTP).to.be.a('string');
            });
            
            // Get the invite URL from the mailslurp email
            it("Should get accept link from the email", async () => {
                acceptLink = await mailslurp.waitForInviteLink(inbox.id);
                expect(acceptLink).to.be.a('string');
        
                console.log("Invite accept link is:", acceptLink);
                await dashboard.logOut();
            });
        
            // Add the new admin to the main superadmin account
            it("Should register another admin to the superadmin account", async () => {
                await dashboard2.open(acceptLink);
                await dashboard2.addAdmin(inviteCodeOTP, testCase.authen, password);
            });
        
            it("Should confirm and delete the new admin", async () => {
                await dashboard.navigateTo(loginURL);
                await dashboard.loginFido2(username);
                await dashboard.deleteAdmin(username);
            });

            // Delete the mailslurp admin for the corresponding test suite
            it("Should delete the mailslurp Inbox", async () => {
                await mailslurp.deleteInbox(inbox.id);
            });
        });
    });

    // Close both of the chrome windows
    after(async () => {
        await dashboard.close();
        await dashboard2.close();
    });
});