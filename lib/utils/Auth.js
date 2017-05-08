var CryptoJS = require("crypto-js");
var errors = require('restify-errors');
var config = require('../props/config');
var momenttz = require('moment-timezone');
//var arr = str.split(",");
//arr = arr.map(function (val) { return +val + 1; });

var auth = function(req, res, next){
	req.allow = { appid: config.permittedapps[0].appid, pass: config.permittedapps[0].apppwd };
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
    //console.log(config.permittedapps[0].appid);
    console.log("U - - - "+CryptoJS.AES.encrypt(config.permittedapps[0].appid+"#blank", config.secret).toString());
    console.log("P - - - "+CryptoJS.AES.encrypt(config.permittedapps[0].apppwd+"#"+momenttz().format()+"#blank", config.secret).toString());
    
    console.log('----------Auth------------ '+CryptoJS.AES.decrypt(authz.username, config.secret).toString(CryptoJS.enc.Utf8));
    console.log('----------Pass------------ '+CryptoJS.AES.decrypt(authz.password, config.secret).toString(CryptoJS.enc.Utf8));
    var userArr = CryptoJS.AES.decrypt(authz.username, config.secret).toString(CryptoJS.enc.Utf8).split("#");
    var pwdArr  = CryptoJS.AES.decrypt(authz.password, config.secret).toString(CryptoJS.enc.Utf8).split("#");
    
    var userId = '';
    var userToken = '';
    var reqTimestamp = '';
    var timems = '';
    try
    {
    	userId = userArr[1];
    	userToken = pwdArr[1];
    	//console.log( 'localDate as UTC format = ' + momenttz.utc( pwdArr[2] ).format() );
    	reqTimestamp = pwdArr[2];//momenttz.utc( pwdArr[2] ).format();
    	//timems = momenttz.utc( pwdArr[2] ).valueOf();
    	//console.log(timems);
    }catch(err){
    	console.log(err);
    	//todo - create auth exception here
    	//as either userid, user g+ or fb token or timestamp is missing.
    }
    //todo - put timezone and request in last two minutes logic later

    if (req.allow.appid !== userArr[0] ||
    		req.allow.pass !== pwdArr[0]) {
    	console.log('----------Auth----------- 6');
        next(new errors.ForbiddenError('invalid app credentials'));
        return;
    }
    
    next();
}

module.exports = auth;