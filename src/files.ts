import { createClient } from '@supabase/supabase-js'
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
            {status: 400}
        )
    }
    const jwtuserid = await extractUserId(uploadFileData.jwt)
    await env.KESTREL_BUCKET.put(uploadFileData.path, b64decode(uploadFileData.filedata_b64))
    if (jwtuserid != uploadFileData.userid) {
        return new Response(
            JSON.stringify({error: "Can only upload data for yourself"}),
            {status: 400}
        )
    }
    return new Response(
        JSON.stringify({message: "File uploaded"}),
        {status: 200}
    )
}