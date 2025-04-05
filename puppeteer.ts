import puppeteer from "npm:puppeteer";

export async function run() {
    const url = "http://www.curseforge.com/wow/addons/raiderio";
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
    await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    const source = await page.content();
    const element = await page.$("script#__NEXT_DATA__");
    const value: string = await page.evaluate((el) => el.textContent, element);
    await browser.close();
    const json: object = JSON.parse(value);
    //await Deno.writeTextFile("curse.json", JSON.stringify(json, null, 4));
    const project = json.props.pageProps.project;
    const result = {
        projectId: project.id,
        projectName: project.name,
        projectSlug: project.slug,
        fileId: project.mainFile.id,
        fileName: project.mainFile.fileName,
        fileLength: project.mainFile.fileLength,
        gameVersion: project.mainFile.primaryGameVersion,
    };
    //console.log(result);
    return result;
}

export function hello() {
    console.log("hello from puppeteer.ts file");
}