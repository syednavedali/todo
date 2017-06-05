// Copyright (c) 2012 Mark Cavage. All rights reserved.

var fs = require('fs');
var path = require('path');
var util = require('util');

var assert = require('assert-plus');
var bunyan = require('bunyan');
var restify = require('restify');
var errors = require('restify-errors');

var jwt = require('restify-jwt');
var authobj = require("./utils/Auth");
var routes = require('./routes/routes');

///--- Errors

errors.makeConstructor('MissingTaskError', {
    statusCode: 409,
    restCode: 'MissingTask',
    message: '"task" is a required parameter'
});


errors.makeConstructor('TodoExistsError', {
    statusCode: 409,
    restCode: 'TodoExists',
    message: 'Todo already exists'
});

errors.makeConstructor('TodoNotFoundError', {
        statusCode: 404,
        restCode: 'TodoNotFound',
        message: 'Todo was not found'
});

///--- Formatters

/**
 * This is a nonsensical custom content-type 'application/todo', just to
 * demonstrate how to support additional content-types.  Really this is
 * the same as text/plain, where we pick out 'task' if available
 */
function formatFungram(req, res, body, cb) {
    if (body instanceof Error) {
        res.statusCode = body.statusCode || 500;
        body = body.message;
    } else if (typeof (body) === 'object') {
        body = body.task || JSON.stringify(body);
    } else {
        body = body.toString();
    }

    res.setHeader('Content-Length', Buffer.byteLength(body));
    return cb(null, body);
}


///--- Handlers

/**
 * Only checks for HTTP Basic Authenticaion
 *
 * Some handler before is expected to set the accepted user/pass combo
 * on req as:
 *
 * req.allow = { user: '', pass: '' };
 *
 * Or this will be skipped.
 */
function authenticate(req, res, next) {
   
	authobj(req,res, next);
   
}

/**
 * Deletes a TODO by name
 */
function deleteTodo(req, res, next) {
    fs.unlink(req.todo, function (err) {
        if (err) {
            req.log.warn(err,
                'deleteTodo: unable to unlink %s',
                req.todo);
            next(err);
        } else {
            res.send(204);
            next();
        }
    });
}



/**
 * Loads up all the stored TODOs from our "database". Most of the downstream
 * handlers look for these and do some amount of enforcement on what's there.
 */
function loadTodos(req, res, next) {
    fs.readdir(req.dir, function (err, files) {
        if (err) {
            req.log.warn(err,
                'loadTodo: unable to read %s',
                req.dir);
            next(err);
        } else {
            req.todos = files;

            if (req.params.name) {
                req.todo = req.dir + '/' + req.params.name;
            }

            req.log.debug({
                todo: req.todo,
                todos: req.todos
            }, 'loadTODO: done');

            next();
        }
    });
}


/**
 * Replaces a TODO completely
 */
function putTodo(req, res, next) {
    if (!req.params.task) {
        req.log.warn({params: req.params}, 'putTodo: missing task');
        next(new errors.MissingTaskError());
        return;
    }

    fs.writeFile(req.todo, JSON.stringify(req.body), function (err) {
        if (err) {
            req.log.warn(err, 'putTodo: unable to save');
            next(err);
        } else {
            req.log.debug({todo: req.body}, 'putTodo: done');
            res.send(204);
            next();
        }
    });
}


///--- API

/**
 * Returns a server with all routes defined on it
 */
function createServer(options) {
    assert.object(options, 'options');
    //assert.string(options.directory, 'options.directory');
    assert.object(options.log, 'options.log');

    // Create a server with our logger and custom formatter
    // Note that 'version' means all routes will default to
    // 1.0.0
    var server = restify.createServer({
        formatters: {
            'application/fungram; q=0.9': formatFungram
        },
        log: options.log,
        name: 'fungramapp',
        version: '1.0.0'
    });

    // Ensure we don't drop data on uploads
    //server.pre(restify.pre.pause()); //Noticed problem with file upload therefore removing this

    // Clean up sloppy paths like //todo//////1//
    server.pre(restify.pre.sanitizePath());

    // Handles annoying user agents (curl)
    server.pre(restify.pre.userAgentConnection());

    // Set a per request bunyan logger (with requestid filled in)
    server.use(restify.requestLogger());

    // Allow 5 requests/second by IP, and burst to 10
    server.use(restify.throttle({
        burst: 10,
        rate: 5,
        ip: true
    }));

    // Use the common stuff you probably want
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.bodyParser());
    server.use(restify.CORS())
    // Now our own handlers for authentication/authorization
    // Here we only use basic auth, but really you should look
    // at https://github.com/joyent/node-http-signature
    server.use(function setup(req, res, next) {

        if (options.user && options.password) {
            req.allow = {
                user: options.user,
                password: options.password
            };
        }
        next();
    });
    
    //Un-comment below to enable basic authentication.
    //server.use(authenticate);

    server.post('/post', routes.upload, routes.createPost);
    server.get('/posts/:criteria/:uid/:lst', routes.listPost);
    server.get('/categories', routes.listCategories);
    server.get('/types', routes.listTypes);

    // be JSON - otherwise the caller will get a 415 if they try
    // to send a different type
    // With the body parser, req.body will be the fully JSON
    // parsed document, so we just need to serialize and save
    server.put({
        path: '/comment',
        contentType: 'application/json'
    }, routes.comment);
    
    server.put({
        path: '/heart/:criteria',
        contentType: 'application/json'
    }, routes.heart);
    
/*    server.put({
        path: '/disheart',
        contentType: 'application/json'
    }, routes.disheart);*/
    
    server.put({
        path: '/cntdownload/:postId'
        //contentType: 'application/json'
    }, routes.cntdownload);
    
    server.put({
        path: '/offence',
        contentType: 'application/json'
    }, routes.offence);
    
    server.put({
        path: '/review',
        contentType: 'application/json'
    }, routes.review);

    // Delete a TODO by name
    //server.del('/todo/:name', deleteTodo);

    // Destroy everything

    // Register a default '/' handler

    server.get('/', function root(req, res, next) {
        var routes = [
            'GET     /',
            'POST     /post',
            'GET     /posts',
            'GET     /categories',
            'GET     /types',
            'PUT     /comment',
            'PUT     /heart',
            'PUT     /offence',
            'PUT     /review'
        ];
        res.send(200, routes);
        next();
    });

    // Setup an audit logger
    if (!options.noAudit) {
        server.on('after', restify.auditLogger({
            body: true,
            log: bunyan.createLogger({
                level: 'info',
                name: 'todoapp-audit',
                stream: process.stdout
            })
        }));
    }

    return (server);
}


///--- Exports

module.exports = {
    createServer: createServer
};
