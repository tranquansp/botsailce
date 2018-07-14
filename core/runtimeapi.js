const Attributes = require(global.appRoot + "/core/attribute.js");
const { MessengerClient } = require('messaging-api-messenger');
const Cache            = require(global.appRoot + '/core/util/cache');

class RuntimeAPI {
	
	constructor(bot_id, client) {
		this.bot_id = bot_id;
		this.attributes = new Attributes();
		this.client = client;
	}
	
	async runProcedure(name) {
		const Func            = require(global.appRoot + '/app/models/entities/function');
		let result = await Func.findOne({bot_id: this.bot_id,datatype: "Function", name: name});
		if((result != undefined) || (result != null)) {
			try {
				let functionStr = result.script;
				let deny = this.checkDenyFunction(functionStr);
				if(deny != null) return deny;
				await eval(functionStr);
			}catch(ex) {
				console.dir(ex);
				return false;
			}
		}
		
		return true;
	}
	
	
	checkDenyFunction(functionStr) {
		let functionStr2 = functionStr.replace(/\s/g, "");	//del space charater
		functionStr2 = functionStr2.toLowerCase();		//conver to lower charater
		let index = 0
		
		let denyList = ["require","import","exec","new", "window","throw"];
		
		for(let i = 0; i < denyList.length; i++) {
			index = functionStr.indexOf(denyList[i]);
			
			if(index > 0) return "[" + denyList[i] + "] is keyword";
		}
		
		return null;
		
	}
	
	async runSanbox(functionStr) {
		let chk = this.checkDenyFunction(functionStr);
		if(chk != null) return chk;
		
		try {
			eval(functionStr);
		}catch(ex) {
			console.dir(ex);
			return false;
		}
		return true;
	}
	
	
	
	setMessengerClient(client) {
		this.client = client;
	}
	
	
	async doRequest(method, url, _paramater, _receive, uid) {
		let params = {};
		if(Common.isset(_paramater) == null) _paramater = [];
		for(let i = 0; i < _paramater.length; i++) {
			params[_paramater[i]] = await this.getUserAttributes(_paramater[i], uid);
		}
		
		var options = {
			method: method,
			uri: url,
			qs: params,
			json: true
		};
		
		let dataList = await this.callHttpRequest(options);
		
		if((Common.isset(dataList) != null) && (Common.isset(_receive) != null)){
			for(let i = 0; i < _receive.length; i++) {
				if(Common.isset(dataList[_receive[i]]) != null) 
					await this.updateUserValueAttributes(_receive[i],uid, dataList[_receive[i]]);
			}
		}
	}
	
	//Send request to other website via URL
	async callHttpRequest(requestData) {
		const request = require('request');
		return new Promise(function (resolve, reject) {
			request(requestData, function (error, res, body) {
				if (!error && res.statusCode == 200) {
					resolve(body);
				} else {
					reject(error);
				}
			});
		});

	}
	
	async createUserAttribute(attribute_name) {
		return await this.attributes.createUserAttribute(this.bot_id, attribute_name);
	}
	
	async addUserAttributes(attribute_name, uid, value) {
		return await this.attributes.addUserAttributes(this.bot_id, attribute_name, uid, value);
	}
	
	
	async getUserAttributes(attribute_name, uid) {
		return await this.attributes.getUserAttributes(this.bot_id, attribute_name, uid);
	}
	
	async delUserAttributes(attribute_name,uid) {
		return await this.attributes.delUserAttributes(this.bot_id,attribute_name,uid);
	}
	
	async updateUserValueAttributes(attribute_name,uid, value) {
		let result = await this.attributes.updateUserValueAttributes(this.bot_id,attribute_name,uid, value);
		const UserAttribute            = require(global.appRoot + '/app/models/entities/userattribute');
		let result = UserAttribute.findOne({bot_id: this.bot_id,datatype: "UserAttribute", name: name});
		if((result != undefined) || (result != null)) {
			try {
				let functionStr = result.trigger;
				let deny = this.checkDenyFunction(functionStr);
				if(deny != null) return deny;
				eval(functionStr);
			}catch(ex) {
				console.dir(ex);
				return false;
			}
		}
		
		
		return result;
	}
	
	async updateUserAttributesName(old_name, new_name){
		return await this.attributes.updateUserAttributesName(this.bot_id,old_name, new_name);
	}
	
	async delUserAttributesRoot(attribute_name){
		return await this.attributes.delUserAttributesRoot(this.bot_id,attribute_name);
	}
	
	
	async addBotAttributes(name, value){
		return await this.attributes.addBotAttributes(this.bot_id,name, value);
	}
	
	async getBotAttributes(name) {
		return await this.attributes.getBotAttributes(this.bot_id,name);
	}
	
	
	async delBotAttributes(name) {
		return await this.attributes.delBotAttributes(this.bot_id,name);
	}
	
	async updateBotvalueAttributes(name, value) {
		return await this.attributes.updateBotvalueAttributes(this.bot_id,name, value);
	}
	
	async updateBotnameAttributes(old_name, new_name) {
		return await this.attributes.updateBotnameAttributes(this.bot_id,old_name, new_name);
	}
	
	async getNameAttributes() {
		return await this.attributes.getNameAttributes(this.bot_id);
	}
	

}

module.exports = RuntimeAPI;