const {
    stringify
} = require('gray-matter')
const {
    join,
    parse,
} = require('path')
const {
    writeFile,
    mkdir,
} = require('fs/promises')
const {
    render
} = require('mustache')
const {
    makeSafe,
    logNotice,
    filePath,
    logError,
    logSuccess,
    makeRelative,
    findConfig
} = require('../../helpers')

function getCollectionConfig(collection) {
    const {
        functions: {
            generators: {
                commands
            }
        }
    } = findConfig()
    const config = commands.find(row => collection === row.type)
    if (!config) {
        throw new Error(`No configuration found for ${collection}`)
    }
    return config;
}

function compileContent({
    argv,
    frontmatter
}) {
    let processed = {};
    for (const [key, value] of Object.entries(frontmatter)) {
        const valueType = typeof value;
        switch (valueType) {
            case 'function':
                processed[key] = value(argv)
                break

            default:
                processed[key] = render(value, argv)
                break
        }
    }
    return stringify(argv.content, processed)
}

function writeContent({
    argv,
    content,
    pathTemplate
}) {
    if (!argv.slug) {
        const safeTitle = makeSafe(argv.title, '-')
        logNotice(`No slug provided, using ${filePath(safeTitle)}`)
        argv.slug = safeTitle
    }

    const writePath = join(process.cwd(), render(pathTemplate, argv))

    const {
        dir
    } = parse(writePath)

    return mkdir(dir)
        .catch(err => {
            // If this already exists, that's ok
            if ('EEXIST' === err.code) {
                return Promise.resolve
            }

            throw err
        })
        .then(() => {
            return writeFile(writePath, content, {
                flag: 'wx'
            })
        })
        .catch(err => {
            if ('EEXIST' === err.code) {
                logError(`${writePath} already exists!`)
            }
            throw err
        })
        .then(() => {
            return makeRelative(writePath)
        })
}

function createMakeCommand({
    name
}) {
    let {
        singular,
        module,
        template: {
            contentPath,
            frontmatter,
        }
    } = getCollectionConfig(name)

    if (undefined === module.handler) {
        module.handler = (argv) => {
            writeContent({
                    argv,
                    pathTemplate: contentPath,
                    content: compileContent({
                        argv,
                        frontmatter,
                    }),
                })
                .then(value => {
                    logSuccess(`Created new ${singular} "${argv.title}" at ${filePath(value)}`)
                })
                .catch(err => console.error(err))
        }
    }

    return module
}

module.exports = {
    getCollectionConfig,
    compileContent,
    writeContent,
    createMakeCommand,
}