var CryptoJS = require("crypto-js");
var errors = require('restify-errors');
var config = require('../props/config');
//var arr = str.split(",");
//arr = arr.map(function (val) { return +val + 1; });

var auth = function(req, res, next){
	req.allow = { appid: config.permittedapps.appid, pass: config.permittedapps.apppwd };
    if (!req.allow){ 
        req.log.debug('skipping authentication');
        next();
        return;
    }
    var authz = req.authorization.basic;

    if (!authz) {
        res.setHeader('WWW-Authenticate', 'Basic realm="fungram"');
        next(new errors.UnauthorizedError('authentication required'));
        return;
    }
    
    //username = appid#userid / fungram#blank / fungram#rahul/
    //password = apppwd#timestamp#userpwd / fgpwd#09:10:23 UTC Thursday, May 4, 2017#raj
    
    var enc = CryptoJS.AES.encrypt("test", config.secret).toString();
    console.log(enc.toString());
    
    console.log('----------Auth------------ '+CryptoJS.AES.decrypt(authz.username, config.secret).toString(CryptoJS.enc.Utf8));
    var userArr = CryptoJS.AES.decrypt(authz.username, config.secret).toString(CryptoJS.enc.Utf8).split("#");
    console.log('---User--------- '+userArr[0]);
    var pwdArr  = CryptoJS.AES.decrypt(authz.password, config.secret).toString(CryptoJS.enc.Utf8).split("#");
    
    
    
   if (req.allow.appid !== userArr[0] ||
    		req.allow.pass !== pwdArr[0]) {
    	console.log('----------Auth----------- 6');
        next(new errors.ForbiddenError('invalid app credentials'));
        return;
    }
    console.log('----------Auth----------- 7');
    next();
}

module.exports = auth;