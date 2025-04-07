export function isDenoDeploy(): boolean {
    return Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined
}