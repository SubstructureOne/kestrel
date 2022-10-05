import { createClient } from '@supabase/supabase-js'
import { Env } from './types'

export async function addAppDbData(
    userid: string,
    appid: number,
    newdatasize: number,
    env: Env
): Promise<void> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    const {error} = await supabase.rpc(
        "increment_db_size",
        {
            p_userid: userid,
            p_appid: appid,
            p_amount: newdatasize,
        }
    )
    if (error) {
        console.log(JSON.stringify(error))
        throw error
    }
}
