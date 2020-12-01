module.exports = {
    createStub: ({
        stub,
        destination,
        modify,
        argv
    }) => {
        const {
            logProgress,
            filePath,
            logNotice,
            makeSafe,
        } = require('../../helpers')
        const {
            parse,
            basename,
        } = require('path')
        const {
            readFile,
            writeFile,
            mkdir,
        } = require('fs/promises')
        const {
            dir
        } = parse(destination)
        if (argv.stub) {
            stub = argv.stub
            logNotice(`Using custom stub ${filePath(argv.stub)}`)
            console.log('')
        }

        const destFilename = basename(destination)
        const stubFilename = basename(stub)

        return mkdir(dir)
            .catch(err => {
                // If directory already exists, that's ok
                if ('EEXIST' === err.code) {
                    return Promise.resolve
                }

                throw err
            })
            .then(() => readFile(stub, 'utf-8'))
            .then(content => {
                const {
                    render
                } = require('mustache')
                // Allow for mustache templating
                let toWrite = render(content, {
                    extension_name: makeSafe(argv.name),
                    // Give mustache templates access to any arguments passed
                    ...argv
                });

                // modifyContent happens after mustache to allow for addl customization
                if (undefined !== modify) {
                    toWrite = modify(content)
                }

                return writeFile(destination, toWrite, {
                    flag: 'wx',
                })
            })
            .catch(err => {
                if ('ENOENT' === err.code) {
                    return Promise.reject(`${filePath(stubFilename)} stub could not be found!`)
                }

                if ('EEXIST' === err.code) {
                    return Promise.reject(`${destFilename} already exists`)
                }

                throw err
            })
            .then(() => logProgress(`Wrote ${filePath(destFilename)}`))
    },
    insertIntoLoader: ({loaderPath, confPath, insertAfter, requireStatement}) => {
        const {
            basename
        } = require('path')
        const {
            readFile,
            writeFile
        } = require('fs/promises')
        const {
            logProgress,
            filePath,
            makeRelative,
        } = require('../../helpers')
        const confRequire = requireStatement || `require('${confPath}')(conf);`
        const confRequireFile = basename(confPath);

        return readFile(loaderPath, 'utf-8')
            .then(content => {
                if (-1 !== content.indexOf(confRequire)) {
                    return Promise.reject(`${confRequireFile} already in loader`)
                }

                let rows = content.split(`\n`)
                console.log(rows)
                const line = rows.findIndex(row => insertAfter.test(row))

                if (-1 === line) {
                    return Promise.reject(`Unable to find "insert after" line in leader`)
                }

                rows.splice(line + 1, 0, `\t${confRequire}`)
                return rows.join(`\n`)
            })
            .then(updated => {
                return writeFile(loaderPath, updated, {
                    flag: 'w',
                })
            })
            .then(() => logProgress(`Updated ${filePath(makeRelative(loaderPath))}`))
    }
}