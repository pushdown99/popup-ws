'use strict';

var dbmsname   = "";
var connection = null;

module.exports = {
    connect: function(name, callback) {
        require('dotenv').config();
        dbmsname = name;

        var mysql       = require('mysql');
        var mysqlopts   = {
            host:       process.env.MYSQL_HOSTNAME,
            user:       process.env.MYSQL_USERNAME,
            password:   process.env.MYSQL_PASSWORD,
            database:   process.env.MYSQL_DATABASE
        };
        //console.log('mysql', mysqlopts);

        var pg          = require('pg');
        var pgopts   = {
            host:       process.env.PG_HOSTNAME,
            port:       process.env.PG_PORT,
            user:       process.env.PG_USERNAME,
            password:   process.env.PG_PASSWORD,
            database:   process.env.PG_DATABASE
        };
        //console.log('pg:', pgopts);

        var mongodb     = require('mongodb');
        var mongodbopts = {
            host:       process.env.MONGODB_HOSTNAME,
            port:       process.env.MONGODB_PORT,
            user:       process.env.MONGODB_USERNAME,
            password:   process.env.MONGODB_PASSWORD,
            database:   process.env.MONGODB_DATABASE
        }
        //console.log('mongodb:', mongodbopts);

        switch(name) {
            case 'mysql':
                connection = mysql.createConnection(mysqlopts); 
                connection.connect(function(err) {
                    if(err) callback(1, err);
                    else    callback(0, "Database connected.");
                }); 
                break;
            case 'pg':
                var conn = 'postgres://' + pgopts.user + ':' + pgopts.password + '@' + pgopts.host + ':' + pgopts.port + '/' + pgopts.database;
                console.log(conn);
                connection = new pg.Client(conn);
                connection.connect(function(err) {
                    if(err) callback(1, err);
                    else    callback(0, "Database connected.");
                }); 
                break;
            case 'mongodb':
//                var conn = 'mongodb://' + mongodbopts.user + ':' + mongodbopts.password + '@' + mongodbopts.host + ':' + mongodbopts.port + '/' + mongodbopts.database;
                var conn = 'mongodb://' + mongodbopts.host + ':' + mongodbopts.port + '/' + mongodbopts.database;
                //console.log(conn);
                connection = mongodb.MongoClient;
                connection.connect(conn, { useNewUrlParser: true }, function(err, db) {
                    if(err) callback(1, err);
                    else    callback(0, "Database connected: " + db.s.url);
                }); 
                break;
        }
    },
    query: function(sql, callback) {
        //console.log(dbmsname, sql);
        switch(dbmsname) {
            case 'mysql':
                connection.query(sql, null, function(err, result) {
                    callback(err, result);
                });        
                break;
            case 'pg':
                connection.query(sql, (err, result) => {
                    console.log('2:', err, result.rows);
                    callback(err, result.rows);
                });
                break;
        }
    }, 
    close: function(callback) {
        connection.end(function(err) {
            if(callback) callback(err);
        });
    }
};
