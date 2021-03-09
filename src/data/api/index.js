const knackAPI = require("../classes/knack.js");
const config = require("../../config/Config.js");

const KNACK_APP_ID = config.appID;
const KNACK_API = config.apiKey;
const knack = new knackAPI(KNACK_APP_ID, KNACK_API);

module.exports = { knack };
