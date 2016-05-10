#!/usr/bin/env node
import * as cliColor from "cli-color";
import * as commander from "commander";
var Liftoff = require("liftoff");
var cliPackage = require('../package');

commander
    .option("-c, --config [configFile]", "Config file")    
    .parse(process.argv);

var args : {
    config: string
} = <any>commander;

var cli = new Liftoff({
    name: 'grebe',
    extensions: {
        ".js": null
    }
});

cli.on('require', function (name: string) {
    console.log('Requiring external module', cliColor.magenta(name));
});

cli.on('requireFail', function (name: string) {
    console.log(cliColor.red('Failed to load external module'), cliColor.magenta(name));
});

cli.on('respawn', function (flags: any, child: any) {
    var nodeFlags = cliColor.magenta(flags.join(', '));
    var pid = cliColor.magenta(child.pid);
    console.log('Node flags detected:', nodeFlags);
    console.log('Respawned to PID:', pid);
});

cli.launch({
    configPath: args.config
}, invoke);

function invoke(env: any) {
    console.log("global grebe is: " + cliPackage.version);
    console.log(" local grebe is: " + env.modulePackage.version);

    if (!env.configPath)
        throw new Error("grebefile not found. Please use --config or put grebefile.js in the project directory");

    require(env.configPath);
    
    var instance = require(env.modulePath);
    instance.run();
}