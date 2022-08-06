import { CreateRowFunctionDataJson, Env, QueryRowsFunctionDataJson, QueryRowsFunctionResult } from './types'
import { createClient } from '@supabase/supabase-js'

export async function createUserDataRow(
    jwt: string,
    createRowData: CreateRowFunctionDataJson,
    env: Env
): Promise<Response> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    supabase.auth.setAuth(jwt)
    const {error} = await supabase
        .from('userdata')
        .insert({
            userid: createRowData.userid,
            appid: createRowData.appid,
            data: createRowData.data,
        })
    if (error) {
        console.log(`Couldn't insert row: ${error.message}`)
        return new Response(
            JSON.stringify({error: error.message}),
            {status: 500}
        )
    }
    return new Response(
        JSON.stringify({message: `Row inserted for user ID ${createRowData.userid}, app ID: ${createRowData.appid}`}),
        {status: 200}
    )
}

export async function queryUserData(
    queryRowData: QueryRowsFunctionDataJson,
    env: Env
): Promise<Response> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    supabase.auth.setAuth(queryRowData.jwt)
    const {data, error} = await supabase
        .from('userdata')
        .select('id, data')
        .filter(queryRowData.column, queryRowData.operator, queryRowData.value)
    if (error) {
        return new Response(
            JSON.stringify({error: error.message}),
            {status: 500}
        )
    }
    const result: QueryRowsFunctionResult = {
        queryinfo: queryRowData,
        results: data
    }
    return new Response(
        JSON.stringify(result),
        {status: 200}
    )
}
