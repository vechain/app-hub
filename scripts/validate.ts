import * as fs from 'fs'
import { promisify } from 'util'
import * as path from 'path'
    
const bundleName = /^(([a-z0-9\-]+\.)+)[a-z0-9\-]+$/
const url = /^(http(s?):\/\/)([a-zA-Z0-9.-]+)(:[0-9]{1,4})?/
let appCount = 0;

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
    let files = await promisify(fs.readdir)(path.join(__dirname, '../apps', dir.name), { withFileTypes: true })
    files.forEach(file => {
        ensure(file.name === 'manifest.json' || file.name === 'logo.png', 'only logo.png and manifest.json allowed')
        ensure(file.isFile(), 'app directory must contain only file')
    })
    ensure(files.length == 2, 'logo.png and manifest.json are both required')

    const manifest = require(path.join(__dirname, '../apps', dir.name, 'manifest.json'))
    ensure(manifest.name && typeof manifest.name === 'string' && manifest.name.length, 'name should be a string')
    ensure(manifest.href && url.test(manifest.href), 'href should be a url')
    ensure(manifest.desc && typeof manifest.desc === 'string' && manifest.desc.length, 'desc should be a string')
    ensure(Array.isArray(manifest.tags), 'tags should be an array')

    manifest.tags.forEach((tag:string) => {
        ensure(!!tag && !!tag.length, 'tags should be a string')
    });
}
    
; (async () => {
    let dirs = await promisify(fs.readdir)(path.join(__dirname, '../apps'), { withFileTypes: true })
    for (let dir of dirs) {
        if (dir.isDirectory()) {
            await checkAPP(dir).catch(e=>{throw new Error(`check ${dir.name} -> ${e.message}`)})
            appCount++
        } else {
            if (dir.name != '.gitkeep') {
                throw new Error('invalid file in apps dir: '+ dir.name)
            }
        }
    }
})().catch(e => {
    console.log(colors.red('Validation failed: '+ e.message))
    process.exit(1)
}).then(() => {
    console.log(colors.green(`Validation passed, processed ${appCount} apps. Congrats!`))
    process.exit(0)
})

