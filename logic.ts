import { Page } from "npm:puppeteer";
import * as browser from "./browser.ts";
import * as logger from "./logger.ts";
import * as parser from "./parser.ts";
import * as results from "./results.ts";

export async function run(addon?: string): Promise<results.LogicResult> {
    logger.log('logic called');
    await browser.init(); // Initialization is re-entrant
    const page = await browser.getPage();
    if (!page) {
        logger.logError('no page');
        return results.createErrorResult('Could not get Puppeteer Page instance.');
    }
    logger.log('got page');
    let addons: string[] = [];
    if (addon) {
        addons = [addon];
    }
    else {
        addons = [
            "raiderio",
            "details",
            "tomtom",
            "recount",
            "handynotes",
        ];
    }
    const finalObjects: object[] = [];
    for (const addon of addons) {
        logger.log(`processing "${addon}" addon now...`);
        const scrapeResult = await scrapeAddonSiteJsonString(page, addon);
        if (scrapeResult.error) {
            return scrapeResult;
        }
        const jsonString = (scrapeResult.result as { jsonString: string }).jsonString;
        const validationResult = parser.validateAddonSiteJsonString(jsonString);
        if (validationResult.error) {
            return validationResult;
        }
        const jsonObject = (validationResult.result as { jsonObject: parser.AddonSiteJsonObject }).jsonObject;
        const creationResult = parser.buildFinalObject(jsonObject);
        if (creationResult.error) {
            return creationResult;
        }
        const finalObject = (creationResult.result as { finalObject: parser.FinalObject }).finalObject
        finalObjects.push(finalObject);
    }
    logger.log('created final objects');
    return results.createSuccessResult(finalObjects);
}

async function scrapeAddonSiteJsonString(page: Page, addon: string): Promise<results.LogicResult> {
    const url = `http://www.curseforge.com/wow/addons/${addon}`;
    await page.goto(url, {
        waitUntil: "load",
        timeout: 30000,
    });
    logger.log('navigated to url');
    const element = await page.$("script#__NEXT_DATA__");
    if (!element) {
        logger.logError('no element');
        const content = await page.content();
        if (content) {
            logger.log('HTML ource was:');
            logger.log(content);
        }
        return results.createErrorResult('The received Curse HTML source not contained "__NEXT_DATA__" script element.');
    }
    logger.log('found element');
    const elementContent = await page.evaluate((el) => el.textContent, element);
    if (!elementContent) {
        logger.logError('empty element');
        return results.createErrorResult('Could not get the element\'s content from the received Curse HTML "__NEXT_DATA__" script element.');
    }
    logger.log('got JSON string');
    return results.createSuccessResult({ jsonString: elementContent as string });
}