import * as fs from 'fs'
import { exec } from 'child_process'
import { EOL } from 'os'
import { promisify } from 'util'
import * as path from 'path'
import imageSize from 'image-size'
import * as github from '@actions/github'
import axios from 'axios'

const bundleName = /^(([a-z0-9\-]+\.)+)[a-z0-9\-]+$/
const url = /^(http(s?):\/\/)([a-zA-Z0-9.-]+)(:[0-9]{1,4})?/
const address = /^0x[a-f0-9]{40}$/
const category = /collectibles|defi|games|marketplaces|utilities/

class ValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ValidationError'

        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

const colors = {
    red(str: string) {
        return `\x1b[31m${str}\x1b[0m`
    },
    green(str: string) {
        return `\x1b[32m${str}\x1b[0m`
    },
}

const ensure = (condition: boolean, msg = 'assert error') => {
    if (!condition) {
        throw new ValidationError(msg)
    }
}

const checkAPP = async (appDir: string) => {
    if (!bundleName.test(appDir)) {
        throw new Error(`invalid app bundle id: ${appDir}`)
    }

    const required = ['manifest.json', 'logo.png']
    let files = await promisify(fs.readdir)(path.join(__dirname, '../apps', appDir), { withFileTypes: true })
    const fNames: string[] = []
    for (let file of files) {
        ensure(file.isFile(), 'folders are not allowed in app directory')
        if (file.name === '.DS_Store') {
            ensure(process.env.CI !== 'true', '.DS_Store is not allowed')
            continue
        }
        ensure(required.includes(file.name), file.name + ' is not allowed')
        fNames.push(file.name)
    }

    for (const name of required) {
        ensure(fNames.includes(name), name + ' is required')
    }

    const dimensions = await promisify(imageSize)(path.join(__dirname, '../apps', appDir, 'logo.png'));
    ensure(!!dimensions && dimensions.type === 'png', 'logo should be image file in png format')
    ensure(!!dimensions && dimensions.height === 512 && dimensions.width === 512, 'logo should be 512x512 in pixel size')

    const manifest = require(path.join(__dirname, '../apps', appDir, 'manifest.json'))
    ensure(manifest.name && typeof manifest.name === 'string', 'name should be a string')
    ensure(manifest.href && typeof manifest.href === 'string' && url.test(manifest.href), 'href should be a url and start with http or https')
    ensure(manifest.desc && typeof manifest.desc === 'string', 'desc should be a string')
    ensure(manifest.category && typeof manifest.category === 'string' && category.test(manifest.category), 'invalid category')
    ensure(manifest.hasOwnProperty('isVeWorldSupported') && typeof manifest.isVeWorldSupported === 'boolean', 'isVeWorldSupported is required and should be a boolean')
    ensure(Array.isArray(manifest.tags), 'tags should be an array')
    if (manifest.repo) {
        ensure(manifest.repo && typeof manifest.repo === 'string' && url.test(manifest.repo), 'repo should be a url and start with http or https')
    }
    if (manifest.contracts) {
        ensure(Array.isArray(manifest.contracts), 'contracts should be an array')
        manifest.contracts.forEach((contract: any) => {
            ensure(contract && typeof contract === 'string' && address.test(contract), 'invalid contract address')
        })
    }
    manifest.tags.forEach((tag: string) => {
        ensure(!!tag && !!tag.length, 'tags should be a string')
    });
}

const getChangedFiles = async (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const baseRef = process.env.GITHUB_BASE_REF as string

        exec(`git diff --name-only origin/${baseRef}`, (err, stdout, stderr) => {
            if (err)
                return reject(err)
            if (stderr)
                return reject(stderr)
            if (!stdout)
                return reject(new Error('Changes not found'))
            return resolve(stdout.split(EOL).filter(x => !!x))
        })
    })
}

const capFirstLetter = (str: string) => { 
    return str.charAt(0).toUpperCase() + str.slice(1)
}

const checkLink = async (appDir: string) => {
    const manifest = require(path.join(__dirname, '../apps', appDir, 'manifest.json'))
    const link = manifest.href

    try {
        await axios.get(link)
    } catch (e) {
        throw new ValidationError(`${link} is not reachable`)
    }
}

if (github.context.eventName === 'pull_request') {
    // pull request action should be configured to run on path 'apps/**'
    void (async () => {
        const list = await getChangedFiles()

        const apps: string[] = []
        for (const fileName of list) {
            if (!fileName.startsWith('apps/')) {
                throw new ValidationError('please do not modify other files while submitting an app')
            }

            const app = fileName.split('/')[1]
            if (!apps.includes(app)) {
                apps.push(app)
            }
        }

        if (apps.length != 1) {
            throw new ValidationError('please submit only one app at a time')
        }

        await checkAPP(apps[0])
        await checkLink(apps[0])
    })().catch(async (e) => {
        console.log(colors.red('Validation failed: ' + (e as Error).message))

        if (e instanceof ValidationError) {
            const token = process.env.GITHUB_TOKEN as string
            const octokit = github.getOctokit(token)

            await octokit.rest.issues.createComment({
                owner: github.context.issue.owner,
                repo: github.context.issue.repo,
                issue_number: github.context.issue.number,
                body: ':warning: ' + capFirstLetter((e as Error).message) || 'Validation failed, please check workflow run logs.'
            })
        }
        process.exit(1)
    }).then(() => {
        console.log(colors.green(`Validation passed, Congrats!`))
        process.exit(0)
    })
} else if (process.argv.length > 2 && process.argv[2] === 'link') { 
    // run link validation
    console.log(colors.green('Validating app links......'))
    let msg = ''
    void (async () => { 
        let dirs = await promisify(fs.readdir)(path.join(__dirname, '../apps'), { withFileTypes: true })
        for (let dir of dirs) {
            if (dir.isDirectory()) {
                try {
                    await checkLink(dir.name)
                } catch (e) {
                    msg += `${dir.name} -> ${(e as Error).message}\n`
                }
            }
        }
        if (!!msg) {
            console.log(colors.red('Validation failed: \n' + msg))
            process.exit(1)
        }
        console.log(colors.green('Validation passed!'))
        process.exit(0)
    })()
}else {
    // run full validation if it's not a pull request
    let appCount = 0
    void (async () => {
        let dirs = await promisify(fs.readdir)(path.join(__dirname, '../apps'), { withFileTypes: true })
        for (let dir of dirs) {
            if (dir.isDirectory()) {
                try {
                    await checkAPP(dir.name)
                } catch (e) {
                    throw new Error(`check ${dir.name} -> ${(e as Error).message}`)
                }
                appCount++
            } else {
                if (dir.name === '.gitkeep')
                    continue
                if (dir.name == '.DS_Store' && process.env.CI !== 'true')
                    continue
                throw new Error('invalid file in apps dir: ' + dir.name)
            }
        }
    })().catch(e => {
        console.log(colors.red('Validation failed: ' + e.message))
        process.exit(1)
    }).then(() => {
        console.log(colors.green(`Validation passed, processed ${appCount} apps. Congrats!`))
        process.exit(0)
    })
}

