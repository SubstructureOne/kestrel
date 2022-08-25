import { CreateRowFunctionDataJson, Env, QueryRowsFunctionDataJson, QueryRowsFunctionResult } from './types'
import { createClient } from '@supabase/supabase-js'

export async function createUserDataRow(
    createRowData: CreateRowFunctionDataJson,
    env: Env
): Promise<Response> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    // supabase.auth.setAuth(createRowData.jwt)
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
    let promise = supabase
        .from('userdata')
        .select('udataid, data')
    for (let filter of queryRowData.filters) {
        promise = promise.filter(filter.column, filter.operator, filter.value)
    }
    const {data, error} = await promise
    if (error) {
        return new Response(
            JSON.stringify({error: error.message}),
            {status: 500}
        )
    }
    const result: QueryRowsFunctionResult = {
        queryinfo: queryRowData,
        results: data ?? []
    }
    return new Response(
        JSON.stringify(result),
        {status: 200}
    )
}
