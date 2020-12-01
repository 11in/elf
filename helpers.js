const chalk = require("chalk")

function findConfig() {
    const configPath = locateConfig()

    if (undefined === configPath) {
        return {}
    }

    return require(configPath)
}

function changeToRoot() {
    
    const configLocation = locateConfig()
    let runningDir = process.cwd()
    if (undefined !== configLocation) {
        const {
            parse
        } = require('path')
        const {
            dir
        } = parse(configLocation)
        if (dir !== runningDir) {
            process.chdir(dir)
            runningDir = dir
        }
        logNotice(`Running from ${runningDir}`)
        return;
    }

    logError("I couldn't find an Elf config file!")
    logNotice("If you would like to generate a config file in the current directly, run `elf make-config`")
}

function locateConfig() {
    const findUp = require("find-up")
    return findUp.sync('elf.config.js')
}

function logNotice(msg) {
    console.log(chalk.blue(`ℹ️ ${msg}`))
}

function logError(msg) {
    console.log(chalk.bgRed.white(`⚠️ Oh No!`))
    console.error(msg)
}

function filePath(path) {
    return chalk.bgGreen.black(` ${path} `)
}

module.exports = {
    logError,
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