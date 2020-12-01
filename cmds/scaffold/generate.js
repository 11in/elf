exports.command = 'generator <name>'
exports.desc = "Scaffold a new generator for making content"
exports.builder = (yargs) => {
    const {
        getSubcommand
    } = require("../../helpers");

    return yargs
        .example([
            [`$0 ${getSubcommand(yargs)} blog`, "Creates a generator for the 'blog' content type"],
            [`$0 ${getSubcommand(yargs)} blog --stub /home/user/file.stub`, "Creates a generator from a custom stub instead of the default"],
        ])
        .options({
            'desc': {
                describe: "Short description for the generated command",
                type: 'string',
                requiresArg: true,
                defaultDescription: "'Create a new [name]'"
            },
            'singular': {
                describe: "The singular term, if different than the name (i.e. 'post' for type 'blog')",
                type: 'string',
                requiresArg: true,
                defaultDescription: "[name]"
            }
        })
}
exports.handler = function (argv) {
    const {
        logError,
        logSuccess,
        filePath,
        makeRelative,
        makeSafe,
    } = require('../../helpers')
    const {
        createStub,
        insertIntoLoader
    } = require('./funcs')
    const {
        join
    } = require('path');
    const safeName = makeSafe(argv.name)
    const fileName = `${safeName}.js`
    const stubPath = join(__dirname, 'stubs', 'generator.stub');
    const generatorDir = join(process.cwd(), 'elf', 'generate');
    const generatorFile = join(generatorDir, fileName);
    const generatorIndex = join(process.cwd(), 'elf.config.js');

    // Handle complex fallbacks
    if (!argv.desc) {
        if (argv.singular) {
            argv.desc = `Create a new ${argv.singular} in the ${argv.name} collection`
        }
        if (!argv.singular) {
            argv.desc = `Create a new ${argv.name}`
        }
    }

    if (!argv.singular) {
        argv.singular = argv.name
    }

    createStub({
            stub: stubPath,
            destination: generatorFile,
            argv
        })
        .then(() => insertIntoLoader({
            loaderPath: generatorIndex,
            confPath: `./${generatorFile}`,
            insertAfter: /(commands:\s*\[)/,
            requireStatement: `require('./${makeRelative(generatorFile)}'),`,
        }))
        .then(() => logSuccess(`${argv.name} added in ${filePath(makeRelative(generatorFile))}`))
        .then(() => {
            if (argv.open) {
                const edit = require('open-editor')
                edit([generatorFile])
            }
        })
        .catch(error => logError(error))
}