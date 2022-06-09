import * as fs from 'fs'
import { promisify } from 'util'
import * as path from 'path'
import imageSize from 'image-size'

const bundleName = /^(([a-z0-9\-]+\.)+)[a-z0-9\-]+$/
const url = /^(http(s?):\/\/)([a-zA-Z0-9.-]+)(:[0-9]{1,4})?/
const address = /^0x[a-f0-9]{40}$/
const category = /collectibles|defi|games|marketplaces|utilities/

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
        throw new Error(msg)
    }
}

const checkAPP = async (dir: fs.Dirent) => {
    if (!bundleName.test(dir.name)) {
        throw new Error(`invalid app bundle id: ${dir.name}`)
    }

    const required = ['manifest.json', 'logo.png']
    let files = await promisify(fs.readdir)(path.join(__dirname, '../apps', dir.name), { withFileTypes: true })
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

    const dimensions = await promisify(imageSize)(path.join(__dirname, '../apps', dir.name, 'logo.png'));
    ensure(!!dimensions && dimensions.type === 'png', 'logo should be image file in png format')
    ensure(!!dimensions && dimensions.height === 512 && dimensions.width === 512, 'logo should be 512x512 in pixel size')

    const manifest = require(path.join(__dirname, '../apps', dir.name, 'manifest.json'))
    ensure(manifest.name && typeof manifest.name === 'string', 'name should be a string')
    ensure(manifest.href && typeof manifest.href === 'string' && url.test(manifest.href), 'href should be a url and start with http or https')
    ensure(manifest.desc && typeof manifest.desc === 'string', 'desc should be a string')
    ensure(manifest.category && typeof manifest.category === 'string' && category.test(manifest.category), 'invalid category')
    ensure(Array.isArray(manifest.tags), 'tags should be an array')
    if (manifest.repo) {
        ensure(manifest.repo && typeof manifest.repo === 'string' && url.test(manifest.repo), 'repo should be a url and start with http or https')
    }
    if (manifest.contracts) {
        ensure(Array.isArray(manifest.contracts), 'contracts should be an array')
        manifest.contracts.forEach((contract: any) => {
            ensure(contract && typeof contract === 'string'&& address.test(contract), 'invalid contract address')
        })
    }
    manifest.tags.forEach((tag: string) => {
        ensure(!!tag && !!tag.length, 'tags should be a string')
    });
}

let appCount = 0
void (async () => {
    let dirs = await promisify(fs.readdir)(path.join(__dirname, '../apps'), { withFileTypes: true })
    for (let dir of dirs) {
        if (dir.isDirectory()) {
            await checkAPP(dir).catch(e => { throw new Error(`check ${dir.name} -> ${e.message}`) })
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

