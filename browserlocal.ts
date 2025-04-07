import puppeteer, { Browser } from "npm:puppeteer";
import * as logger from "./logger.ts";

export async function getBrowser(): Promise<Browser> {
    const browser = await puppeteer.launch({ headless: false });
    logger.log('using local puppeteer browser', true);
    return browser;
}