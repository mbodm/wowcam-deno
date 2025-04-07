export function log(msg: string) {

    const timestamp = new Date().toISOString();
    console.log(`[MBODM ${timestamp}] ${msg}`);
}

export function logError(msg: string) {

    const timestamp = new Date().toISOString();
    console.log(`[MBODM ${timestamp}] Error: ${msg}`);
}