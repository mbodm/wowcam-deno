import puppeteer, { Browser } from "npm:puppeteer";
import * as logger from "./logger.ts";

export async function getBrowser(): Promise<Browser> {
    const token: string = "S42yoRC63FDa8Q934df9427c3a356b624f3ab12320";
    //const launchArgs: string = JSON.stringify({ stealth: true });
    //const endpoint: string = `wss://production-sfo.browserless.io/?token=${token}&proxy=residential&launch=${launchArgs}`;
    const endpoint: string = `wss://production-sfo.browserless.io/?token=${token}&proxy=residential`;
    const browser: Browser = await puppeteer.connect({ browserWSEndpoint: endpoint });
    logger.log('using browserless.io service', true);
    return browser;
}