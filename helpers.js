const chalk = require("chalk")

function findConfig() {
    const {
        join
    } = require('path')
    const searchPath = process.cwd()
    return require(join(searchPath, 'elf.config.js'))
}

function changeToRoot() {
    const {
        join
    } = require('path')
    const searchPath = process.cwd()
    try {
        findConfig()
        logNotice(`Running from ${filePath(process.cwd())}`)
        return true;
    } catch (err) {
        if (err.message.indexOf('elf.config.js') > -1) {
            process.chdir('../') // move up one level
            if (searchPath === process.cwd()) {
                throw new Error("I couldn't find an Elf config file!")
            }
            return changeToRoot()
        }

        throw err
    }
}

function logNotice(msg) {
    console.log(chalk.blue(`ℹ️ ${msg}`))
}

function filePath(path) {
    return chalk.bgGreen.black(` ${path} `)
}

module.exports = {
    logError: error => {
        console.log(chalk.bgRed.white(`⚠️ Oh No!`))
        console.error(error)
    },
    logProgress: msg => {
        console.log(chalk.green(msg))
    },
    logSuccess: msg => {
        console.log(``)
        console.log(chalk.blue(`✅ ${msg}`))
    },
    logNotice,
    filePath,
    makeRelative: path => {
        return path.replace(`${process.cwd()}/`, '')
    },
    makeSafe: (string, replace = '_') => {
        return string.replace(/[^a-z0-9_]/gi, replace).toLowerCase()
    },
    getSubcommand: yargs => {
        return yargs.getContext().commands.join(' ')
    },
    findConfig,
    changeToRoot
}