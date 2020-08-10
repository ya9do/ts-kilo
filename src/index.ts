// import "tty"
import * as readline from "readline"
const wait = (msec: number) => new Promise(resolve => setTimeout(resolve, msec))

type TConfig = {
    cx: number,
    cy: number,
    rowoff: number,
    coloff: number,
    screenrows: number,
    numrows: number,
    rawmode: number,
    row: TRow | null,
    dirty: number,
    filename: string | null,
    statusmsg: string,
    statusmsg_time: number,
    quit_times: number,
}

type abuf = {
    b: string,
}

const abAppend = (ab: abuf, s: string) => {
    ab.b = ab.b + s
}

const refleshScreen = (cfg: TConfig) => {
    process.stdout.cursorTo(0,0)
    let buf = ""
    let rows = process.stdout.rows
    let cols = process.stdout.columns
    for(let i = 0;i<rows-1; i++){
        buf += "" + "\n"
    }
    // status bar
    // TODO
    // padding right edge, if rewrite strings is shorter than previous, the last chunk of previous will remain.
    buf += `this is the last line Ln: ${cfg.cy}, Col: ${cfg.cx}  `
    process.stdout.write(buf)
    process.stdout.cursorTo(cfg.cx, cfg.cy)
}

// TODO
// dynamic reflection on change of window size

/**
 * Constants
 */
const KILO_QUIT_TIMES = 3

const moveCursor = (direction: string, cfg: TConfig) => {
    switch (direction) {
        case "up":
            cfg.cy--
            if(cfg.cy < 0) cfg.cy = 0
            break
        case "down":
            cfg.cy++
            if(cfg.cy > process.stdout.rows - 2) cfg.cy = process.stdout.rows - 2
            break
        case "left":
            cfg.cx--
            if(cfg.cx < 0) cfg.cx = 0
            break
        case "right":
            cfg.cx++
            if(cfg.cx > process.stdout.columns) cfg.cx = process.stdout.columns
            break
        default:
    }
    refleshScreen(cfg)
}

const processKeypress = (str: string, key: any, cfg: TConfig) => {
    if (key.name == "up" || key.name == "down" || key.name == "right" || key.name == "left") {
        moveCursor(key.name, cfg)
    } else if (key.ctrl && key.name === 'c' && cfg.quit_times <= 1) {
        process.stdout.write("Ctrl-C pressed \n")
        process.exit(1)
    } else if (key.ctrl && key.name === 'c') {
        process.stdout.write(`${cfg.quit_times - 1} times more to quit \n`)
        cfg.quit_times--
    }
}

const initEditor = (cfg: TConfig) => {
    readline.emitKeypressEvents(process.stdin)
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true)
    }
    process.stdin.setEncoding('utf8')
    process.stdin.on('keypress', (str, key) => processKeypress(str, key, cfg))

    process.stdout.on('resize', () => {
        // TODO
        // refresh window to adjust contents and window size
    });

    cfg.quit_times = KILO_QUIT_TIMES
    cfg.cx = 0;
    cfg.cy = 0;
    cfg.rowoff = 0;
    cfg.coloff = 0;
    cfg.numrows = 0;
    cfg.row = null;
    cfg.dirty = 0;
    cfg.filename = null;

    //TODO
    //E.syntax = NULL;

}

type TRow = {
    idx: number,
    size: number,
    rsize: number,
    chars: string,
    render: string,
    hl: string,
    hl_oc: number
}

const main = async () => {
    console.clear()
    let cfg: TConfig = {} as TConfig
    initEditor(cfg)

    // while(true){
    //     refleshScreen(cfg)
    // }
    // process.stdout.write("hello: ");
    // await wait(1000)
    // flush()
    // await wait(1000)
    // clear()
    // await wait(1000)
}

main()