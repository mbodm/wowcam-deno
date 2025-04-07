import * as results from "./results.ts";
import * as logger from "./logger.ts";

export type AddonSiteJsonObject = {
    props: {
        pageProps: {
            project: {
                id: number,
                name: string,
                slug: string,
                mainFile: {
                    id: number,
                    fileName: string,
                    fileLength: number,
                    primaryGameVersion: string
                }
            }
        }
    }
};

export type FinalObject = {
    projectId: number | null,
    projectName: string | null,
    projectSlug: string | null,
    fileId: number | null,
    fileName: string | null,
    fileLength: number | null,
    gameVersion: string | null,
    downloadUrl: string | null,
}

export function validateAddonSiteJsonString(jsonString: string): results.LogicResult {
    const jsonObject = JSON.parse(jsonString) as AddonSiteJsonObject;
    logger.log('parsed JSON', true);
    const project = jsonObject?.props?.pageProps?.project;
    if (!project) {
        logger.logError('no project in JSON', true);
        return results.createErrorResult('Could not determine "project" in Curse JSON data.');
    }
    const file = project.mainFile;
    if (!file) {
        logger.logError('no mainFile in JSON', true);
        return results.createErrorResult('Could not determine the project\'s "mainFile" in Curse JSON data.');
    }
    if (!project.id) {
        logger.logError('no project.id in JSON', true);
        return results.createErrorResult('Could not determine the project\'s "id" in Curse JSON data (which is necessary for download URL).');
    }
    if (!file.id) {
        logger.logError('no mainFile.id in JSON', true);
        return results.createErrorResult('Could not determine the mainFile\'s "id" in Curse JSON data (which is necessary for download URL).');
    }
    logger.log('validated JSON', true);
    return results.createSuccessResult({ jsonObject });
}

export function buildFinalObject(jsonObject: AddonSiteJsonObject): results.LogicResult {
    const project = jsonObject.props.pageProps.project;
    const file = project.mainFile;
    const url = `https://www.curseforge.com/api/v1/mods/${project.id}/files/${file.id}/download`;
    logger.log('combined download URL', true);
    const finalObject: FinalObject = {
        projectId: project.id ?? null,
        projectName: project.name ?? null,
        projectSlug: project.slug ?? null,
        fileId: file.id ?? null,
        fileName: file.fileName ?? null,
        fileLength: file.fileLength ?? null,
        gameVersion: file.primaryGameVersion ?? null,
        downloadUrl: url ?? null
    };
    logger.log('built final object', true);
    return results.createSuccessResult({ finalObject });
}