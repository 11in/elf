#!/usr/bin/env node


exports.command = 'make <command>'
exports.description = 'Make content, or at least the beginnings of content'
exports.builder = (yargs) => {
  const {
    findConfig
  } = require('../helpers')
  const {
    createMakeCommand
  } = require('./make/funcs')
  const {
    functions: {
      make: {
        commands
      }
    }
  } = findConfig();

  let newYargs = yargs
    .commandDir('make');

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