#!/usr/bin/env node
const {
    DateTime
} = require("luxon");

exports.command = ['generate <title>', 'gen <title>']
exports.description = 'Make content, or at least the beginnings of content'
exports.builder = (yargs) => {
    const {
        findConfig
    } = require('../helpers')
    const {
        createMakeCommand
    } = require('./generate/funcs')
    const {
        functions: {
            generators: {
                commands
            }
        }
    } = findConfig();

    let newYargs = yargs
        .commandDir('generate')
        .alias('gen', 'generate')
        .options({
            'slug': {
                alias: 's',
                requiresArg: true,
                type: 'string',
                default: '',
                description: "Part of the filename and also the URL",
                defaultDescription: "A sanitized version of the title"
            },
            'date': {
                alias: 'd',
                type: 'string',
                requiresArg: true,
                default: DateTime.local(),
                defaultDescription: "Current date and time",
                description: "The date (and optionally time) in an ISO 8061 compatible format",
                coerce: arg => DateTime.fromISO(arg)
            },
            'content': {
                alias: 'c',
                type: 'string',
                requiresArg: true,
                description: "The content of the entry, in markdown.",
                default: '',
                defaultDescription: "An empty string"
            }
        });

    if (undefined !== commands && commands.length > 0) {
        commands.forEach(({
                              type
                          }) => {
            newYargs = newYargs.command(createMakeCommand({
                name: type
            }))
        })
    }

    return newYargs;
}
exports.handler = function (argv) {
    console.log(argv)
}
