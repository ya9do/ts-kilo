// import "tty"
import * as readline from "readline"
const wait = (msec: number) => new Promise(resolve => setTimeout(resolve, msec))

/**
 * Constants
 */
const KILO_QUIT_TIMES = 3
const STATUS_BAR_ROWS = 2

type TConfig = {
    cx: number,
    cy: number,
    rowoff: number,
    coloff: number,
    screenrows: number,
    numrows: number,
    rawmode: number,
    lines: string[],
    dirty: number,
    filename: string | null,
    statusmsg: string,
    statusmsg_time: number,
    quit_times: number,
    lastKey: string | null,
}

type abuf = {
    b: string,
}

const abAppend = (ab: abuf, s: string) => {
    ab.b = ab.b + s
}

/** ================ screen ====================*/
const refleshScreen = (cfg: TConfig) => {
    process.stdout.cursorTo(0, 0)
    let buf = ""
    let rows = process.stdout.rows
    let cols = process.stdout.columns

    // TODO offset
    for (let i = 0; i < rows - STATUS_BAR_ROWS; i++) {
        if (cfg.lines[i]) {
            buf += cfg.lines[i].padEnd(process.stdout.columns) + "\n"
        }else{
            buf += "".padEnd(process.stdout.columns) + "\n"
        }
    }
    // status bar
    process.stdout.write(buf)
    refleshStatusBar(cfg)
    process.stdout.cursorTo(cfg.cx, cfg.cy)
}

const refleshStatusBar = (cfg: TConfig) => {
    process.stdout.cursorTo(0, process.stdout.rows-STATUS_BAR_ROWS)
    let buf = `HELP: Press Ctrl-Q 3times to quit. Ln: ${cfg.cy}, Col: ${cfg.cx}, Key: ${cfg.lastKey}`.padEnd(process.stdout.columns)
    process.stdout.write(buf + "\n")
    process.stdout.write(cfg.lines.join("R"))
    process.stdout.cursorTo(cfg.cx, cfg.cy)
}

// TODO
// dynamic reflection on change of window size

const delChar = (cfg: TConfig) => {
    //TODO
    // think about offset

    if (cfg.cx == 0) {
        if(cfg.cy == 0){
            //TODO
        }else{
            const prevLast = cfg.lines[cfg.cy-1].length
            cfg.lines[cfg.cy-1] = cfg.lines[cfg.cy-1] + cfg.lines[cfg.cy]
            cfg.lines.splice(cfg.cy, 1)
            cfg.cx = prevLast
            cfg.cy--
            // TODO
            // take care delete pressed where no text
        }
    } else if (cfg.lines[cfg.cy]) {
        const orig = cfg.lines[cfg.cy]
        cfg.lines[cfg.cy] = orig.slice(0, cfg.cx-1) + orig.slice(cfg.cx)
        cfg.cx--
    } else {
        cfg.cx--
    }
}

const insertRow = (cfg: TConfig) => {
    cfg.lines.push("")
}

const insertChar = (c: string, cfg: TConfig) => {
    let fileRow = cfg.rowoff + cfg.cy
    let fileCol = cfg.coloff + cfg.cx

    if(!cfg.lines[fileRow]){
        while(cfg.lines.length <= fileRow){
            insertRow(cfg)
        }
    }

    // pad the string with spaces if the insert location is outside current length
    if(fileCol > cfg.lines[fileRow].length){
        cfg.lines[fileRow] = cfg.lines[fileRow].padEnd(fileCol)
    }
    const orig = cfg.lines[fileRow]
    cfg.lines[fileRow] = orig.slice(0, fileCol) + c + orig.slice(fileCol)
    cfg.cx++
}

const moveCursor = (direction: string, cfg: TConfig) => {
    switch (direction) {
        case "up":
            cfg.cy--
            if (cfg.cy < 0) cfg.cy = 0
            break
        case "down":
            cfg.cy++
            if (cfg.cy > process.stdout.rows - 2) cfg.cy = process.stdout.rows - 2
            break
        case "left":
            cfg.cx--
            if (cfg.cx < 0) cfg.cx = 0
            break
        case "right":
            cfg.cx++
            if (cfg.cx > process.stdout.columns) cfg.cx = process.stdout.columns
            break
        default:
    }
}

const processKeypress = (str: string, key: any, cfg: TConfig) => {
    if (key.name == "up" || key.name == "down" || key.name == "right" || key.name == "left") {
        moveCursor(key.name, cfg)
    } else if (key.name == "backspace" || key.name == "delete") {
        delChar(cfg)
    } else if (key.ctrl && key.name === 'q' && cfg.quit_times <= 1) {
        process.stdout.write("Ctrl-q pressed \n")
        process.exit(1)
    } else if (key.ctrl && key.name === 'q') {
        process.stdout.write(`press Ctrl-Q ${cfg.quit_times - 1} times more to quit \n`)
        cfg.quit_times--
    } else {
        insertChar(key.name, cfg)
    }
    cfg.lastKey = key.name
    refleshScreen(cfg)
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
    cfg.lines = [];
    cfg.dirty = 0;
    cfg.filename = null;
    cfg.lastKey = null;
    refleshStatusBar(cfg)
    //TODO
    //E.syntax = NULL;

}

const testInput = (cfg: TConfig) => {
    if (cfg.lines) {
        cfg.lines[0] = "test line1"
        cfg.lines[1] = "test line2"
        cfg.lines[2] = "test line3"
    }
    refleshScreen(cfg)
}

const main = async () => {
    console.clear()
    let cfg: TConfig = {} as TConfig
    initEditor(cfg)
    testInput(cfg)
}

main()