import { Env, UploadFileJsonData } from './types'
import { verifyJwt, extractUserId } from './auth'
import { b64decode } from './encoding'

export async function uploadFile(
    uploadFileData: UploadFileJsonData,
    env: Env
): Promise<Response> {
    if (!await verifyJwt(uploadFileData.jwt, env.SUPABASE_JWT_SECRET)) {
        return new Response(
            JSON.stringify({error: "JWT failed to verify"}),
            {status: 403}
        )
    }
    const jwtuserid = await extractUserId(uploadFileData.jwt)
    if (jwtuserid != uploadFileData.userid) {
        return new Response(
            JSON.stringify({error: "Can only upload data for yourself"}),
            {status: 403}
        )
    }
    let filebytes
    try {
        filebytes = b64decode(uploadFileData.filedata_b64)
    } catch (e) {
        console.log(`Failed to decode: ${JSON.stringify(e)}`)
        return new Response(
            JSON.stringify({error: "Failed to decode file data"}),
            {status: 400}
        )
    }
    console.log("Uploading file")
    await env.KESTREL_BUCKET.put(uploadFileData.path, filebytes)
    return new Response(
        JSON.stringify({message: "File uploaded"}),
        {status: 200}
    )
}