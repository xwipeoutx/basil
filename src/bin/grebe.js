#!/usr/bin/env node
"use strict";
var cliColor = require("cli-color");
var minimist = require("minimist");
var Liftoff = require("liftoff");
var cliPackage = require('../../package');
var argv = minimist(process.argv.slice(2));
var cli = new Liftoff({
    name: 'grebe',
    extensions: {
        ".js": null
    }
});
cli.on('require', function (name) {
    console.log('Requiring external module', cliColor.magenta(name));
});
cli.on('requireFail', function (name) {
    console.log(cliColor.red('Failed to load external module'), cliColor.magenta(name));
});
cli.on('respawn', function (flags, child) {
    var nodeFlags = cliColor.magenta(flags.join(', '));
    var pid = cliColor.magenta(child.pid);
    console.log('Node flags detected:', nodeFlags);
    console.log('Respawned to PID:', pid);
});
cli.launch({}, invoke);
function invoke(env) {
    console.log("global grebe is: " + cliPackage.version);
    console.log(" local grebe is: " + env.modulePackage.version);
    if (!env.configPath)
        throw new Error("grebefile not foudn");
    require(env.configPath);
    var grebeInstance = require(env.modulePath);
    grebeInstance.run();
}
