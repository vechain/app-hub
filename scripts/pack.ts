import * as fs from 'fs'
import { promisify } from 'util'
import * as path from 'path'
import { exec } from 'child_process'
import { PROMOTED_APP_IDS } from './promoted'
const PngQuant = require('pngquant')

const readDir = promisify(fs.readdir)
const lStat = promisify(fs.lstat)
const rmDir = promisify(fs.rmdir)
const unLink = promisify(fs.unlink)
const exists = promisify(fs.exists)
const copyFile = promisify(fs.copyFile)
const mkDir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)

const SYNC_APP_COUNT = 10
const MAX_PROMOTED = 3

let appCount = 0
const colors = {
    red(str: string) {
        return `\x1b[31m${str}\x1b[0m`
    },
    green(str: string) {
        return `\x1b[32m${str}\x1b[0m`
    },
}

const getCreateTimeFromGit = async (dir: string): Promise<Date> => {
    const command = 'git log --diff-filter=A --follow --format=%aD -- [path] | tail -1'
    const dirPath = path.join(__dirname, '../apps', dir)
    const result = await new Promise<string>((resolve, reject) => {
        exec(command.replace("[path]", dirPath), (err, stdout, stderr) => {
            if(err)
                return reject(err)
            if (stderr)
                return reject(stderr)
            if (!stdout)
                return reject(new Error('Can not find create time from git for dir: '+dir))
            return resolve(stdout)
        })
    })
    return new Date(result)
}

const cleanFileOrDir = async (p: string) => {
    let s = await lStat(p)
    if (s.isFile()) {
        await unLink(p)
    } else {
        let files = await readDir(p)
        if (files.length) {
            for (let file of files) {
                await cleanFileOrDir(path.join(p, file))
            }
            await rmDir(p)
        } else {
            await rmDir(p)
        }
    }
}

const compressPngFile = function (src: string, dist: string) {
    const s = fs.createReadStream(src)
    const d = fs.createWriteStream(dist)
    s.pipe(new PngQuant()).pipe(d)
    
    return new Promise<void>((resolve, reject) => {
        s.on('error', err => {
            reject(err)
        })
        d.on('error', err => {
            reject(err)
        })
        d.on('finish', () => {
            resolve()
        })
    })
}
    
const cleanOutput = async () => {
    console.log(colors.green('Clearing output......'))
    let f = path.join(__dirname, '../dist')
    if (await exists(f)) {
        await cleanFileOrDir(f)
    }
    await mkDir(path.join(f, 'imgs'), {recursive:true})
    await copyFile(path.join(__dirname, '../public/package.json'), path.join(__dirname, '../dist/package.json'))
}
    
const pickSyncAppList = (apps: { id: string }[]) => {
    if (apps.length < SYNC_APP_COUNT) {
        return apps
    }

    const ids = new Set(PROMOTED_APP_IDS)
    
    const initialCnt = SYNC_APP_COUNT - MAX_PROMOTED
    const sync = apps.slice(0, initialCnt)

    const promoted:{ id: string }[] =[]
    for (let i = initialCnt; i < apps.length; i++){
        if (promoted.length >= MAX_PROMOTED) {
            break
        }

        if (ids.has(apps[i].id)) {
            promoted.push(apps[i])
        }
    }


    for (let i = initialCnt; i < apps.length; i++){
        if (sync.length + promoted.length >= SYNC_APP_COUNT) {
            break
        }

        if (!ids.has(apps[i].id)) {
            sync.push(apps[i])
        }
    }
    
    return sync.concat(promoted)
}

; (async () => {
    await cleanOutput()
    let apps = []
    let dirs = await readDir(path.join(__dirname, '../apps'))
    for (let dir of dirs) { 
        if (dir === '.gitkeep')
            continue
        const cTime = await getCreateTimeFromGit(dir)
        const manifest = require(path.join(__dirname, '../apps', dir, 'manifest.json'))
        await compressPngFile(path.join(__dirname, '../apps', dir, 'logo.png'), path.join(__dirname, '../dist/imgs', dir + '.png'))
        apps.push({
            ...manifest,
            id: dir,
            createAt: cTime.getTime()
        })
        appCount++
    }
    apps = apps.sort((a, b) => {
        if (a.createAt > b.createAt) {
            return -1
        }
        if (a.createAt < b.createAt) {
            return 1
        }
        return 0
    })
    await writeFile(path.join(__dirname, '../dist', 'sync.json'), JSON.stringify(pickSyncAppList(apps)))
    await writeFile(path.join(__dirname, '../dist', 'index.json'), JSON.stringify(apps))
})().catch(e => {
    console.log(colors.red('Pack apps failed: ' + e.message))
    process.exit(1)
}).then(() => {
    console.log(colors.green(`Packed ${appCount} apps. Congrats!`))
    process.exit(0)
})
