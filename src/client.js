/** Core class of the module. */
const client = require("../src/music")

class Client {
	/**
	 * DiscordToken attributes are mandatory.
	 *
	 * @param {Object} options
	 */
	constructor(key) {
	
    this.key = key
    
		this.queue = new Map();
    this.vote = new Map();

	}
}

module.exports = Client