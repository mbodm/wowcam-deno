import { Browser, Page } from "npm:puppeteer";
import * as browserless from "./browserless.ts";
import * as browserlocal from "./browserlocal.ts";
import * as logger from "./logger.ts";

const useLocal: boolean = false;

let browser: Browser | null = null;

export async function init(): Promise<boolean> {
    if (!browser) {
        try {
            browser = useLocal ? await browserlocal.getBrowser() : await browserless.getBrowser();
        }
        catch {
            logger.logError('puppeteer browser initialization exception occurred');
            browser = null;
            return false;
        }
    }
    logger.log('puppeteer initalized', true);
    return true;
}

export async function deinit(): Promise<boolean> {
    if (browser) {
        try {
            await browser.close();
            browser = null;
        }
        catch {
            logger.logError('puppeteer browser de-initialization exception occurred');
            return false;
        }
    }
    logger.log('puppeteer de-initalized', true);
    return true;
}

export function isInitialized(): boolean {
    return browser !== null;
}

export async function getPage(): Promise<Page | null> {
    if (!isInitialized()) {
        throw new Error("The module was not initialized yet (please call the appropriate initialization method first).");
    }
    try {
        const page = await browser!.newPage();
        await page.setJavaScriptEnabled(true);
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en' });
        logger.log('new page created', true);
        return page;
    }
    catch (e: unknown) {
        logger.logError('puppeteer page initialization exception occurred');
        if (e instanceof Error) {
            logger.logError(e.message);
        }
        return null;
    }
}