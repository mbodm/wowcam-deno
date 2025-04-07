import * as parser from "./parser.ts";
import * as results from "./results.ts";

export async function run(addon?: string): Promise<results.LogicResult> {
    let addons: string[] = [];
    if (addon) {
        addons = [addon];
    }
    else {
        addons = [
            "deadly-boss-mods",
            "details",
            "groupfinderflags",
            "handynotes",
            "handynotes-the-war-within",
            "raiderio",
            "tomtom",
            "weakauras-2"
        ];
    }
    const finalObjects = [];
    for (const addon of addons) {
        const jsonString = await sendQuery(addon);
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
    return results.createSuccessResult(finalObjects);
}

export async function sendQuery(addon: string): Promise<string> {
    const token = 'S42yoRC63FDa8Q934df9427c3a356b624f3ab12320';
    const url = `https://www.curseforge.com/wow/addons/${addon}`;
    const variables = { url };
    const query = `
    mutation Main($url: String!) {
        goto(url: $url waitUntil: load) {
            status
            time
        }
        elementHTML: html(selector: "script#__NEXT_DATA__") {
            html
            time
        }
    }
    `;
    const endpoint = `https://production-sfo.browserless.io/chromium/bql?token=${token}&timeout=30000`;
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            query,
            variables
        }),
    };
    const response = await fetch(endpoint, options);
    if (!response.ok) {
        throw new Error(`Got non-success BQL response:\n` + (await response.text()));
    }
    const { data } = await response.json();
    return data.elementHTML.html;
}