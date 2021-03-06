const {
    logError,
    logSuccess,
    filePath,
    makeRelative,
    makeSafe,
    getSubcommand,
} = require('../../helpers')
const {
    createStub,
    insertIntoLoader
} = require('./funcs')

exports.command = 'shortcode <name>'
exports.desc = 'Scaffold a new shortcode or shortcode collection'
exports.builder = (yargs) => {
    return yargs
        .example([
            [`$0 ${getSubcommand(yargs)} spaceship`, "Creates a shortcode called 'spaceship'"],
            [`$0 ${getSubcommand(yargs)} spaceship --stub /home/user/file.stub`, "Creates an shortcode from a custom stub instead of the default"],
        ])
}
exports.handler = function (argv) {
    const {
        join
    } = require('path');
    const safeName = makeSafe(argv.name)
    const fileName = `${safeName}.js`
    const stubPath = join(__dirname, 'stubs', 'shortcode.stub');
    const shortcodeDir = join(process.cwd(), '11ty', 'shortcodes');
    const shortcodeFile = join(shortcodeDir, fileName);
    const shortcodeIndex = join(shortcodeDir, 'loader.js');

    // Create the shortcode file
    createStub({
        stub: stubPath,
        destination: shortcodeFile,
        argv,
    })
        .then(() => insertIntoLoader({
            loaderPath: shortcodeIndex,
            confPath: `./${fileName}`,
            insertAfter: /module\.exports = conf => {/,
            requireStatement: `require('./${makeRelative(shortcodeFile)}'),`
        }))
        .then(() => logSuccess(`${argv.name} added in ${filePath(makeRelative(shortcodeFile))}`))
        .then(() => {
            if (argv.open) {
                const edit = require('open-editor')
                edit([shortcodeFile])
            }
        })
        .catch(error => logError(error))
}
