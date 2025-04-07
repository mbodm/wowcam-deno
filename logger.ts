import * as platform from "./platform.ts";

export function log(msg: string, skipOnDenoDeploy?: boolean) {
    writeLogMessage(msg, '', skipOnDenoDeploy);
}

export function logError(msg: string, skipOnDenoDeploy?: boolean) {
    writeLogMessage(msg, 'Error: ', skipOnDenoDeploy);
}

function writeLogMessage(msg: string, label: string, skipOnDenoDeploy?: boolean) {
    if (skipOnDenoDeploy === undefined) {
        skipOnDenoDeploy = false;
    }
    const isDenoDeploy = platform.isDenoDeploy();
    if (isDenoDeploy && skipOnDenoDeploy) {
        return;
    }
    const timestamp = isDenoDeploy ? '' : `[${new Date().toISOString()}] `; // Deno Deploy has its own timestamps
    console.log(`${timestamp}${label}${msg}`);
}