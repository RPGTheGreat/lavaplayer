/** Core class of the module. */
const client = require("../src/music")

class Client {
	/**
	 * DiscordToken attributes are mandatory.
	 *
	 * @param {Object} options
	 */
	constructor(key) {
if(!key) throw new Error("[YT_API_KEY] Invalid YT_API_KEY"
if (typeof key !== "string") throw new Error("[YT_API_KEY] YT_API_KEY Must be a string")
    this.key = key
    
		this.queue = new Map();
    this.vote = new Map();

	}
}

module.exports = Client
