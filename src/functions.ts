import {
    CreateRowFunctionDataJson,
    Env,
    QueryRowsFunctionDataJson,
    QueryRowsFunctionResult,
    UpdateRowFunctionDataJson
} from './types'
import { createClient } from '@supabase/supabase-js'
import { addAppDbData } from './apps'

export async function createUserDataRow(
    createRowData: CreateRowFunctionDataJson,
    env: Env
): Promise<Response> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    supabase.auth.setAuth(createRowData.jwt)
    if (supabase.auth.session()?.user?.id != createRowData.userid) {
        return new Response(
            JSON.stringify({"error": "Can only create your own data"}),
            {status: 403}
        )
    }
    const supabase_service = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    const {error} = await supabase_service
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
    await addAppDbData(
        createRowData.userid,
        createRowData.appid,
        // FIXME: use storage size in PostgreSQL JSONB
        JSON.stringify(createRowData.data).length,
        env
    )
    return new Response(
        JSON.stringify({message: `Row inserted for user ID ${createRowData.userid}, app ID: ${createRowData.appid}`}),
        {status: 200}
    )
}

export async function updateUserDataRow(
    updateRowData: UpdateRowFunctionDataJson,
    env: Env
): Promise<Response> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    supabase.auth.setAuth(updateRowData.jwt)
    if (supabase.auth.session()?.user?.id != updateRowData.userid) {
        return new Response(
            JSON.stringify({"error": "Can only update your own data"}),
            {status: 403}
        )
    }
    const supabase_service = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    let promise = supabase_service
        .from('userdata')
        .update({
            data: updateRowData.newData,
            count: "exact",
        }).match({userid: updateRowData.userid, appid: updateRowData.appid})
    for (let filter of updateRowData.filters) {
        promise = promise.filter(filter.column, filter.operator, filter.value)
    }
    const {error, count} = await promise
    if (error) {
        return new Response(
            JSON.stringify({error: error.message}),
            {status: 500}
        )
    }
    return new Response(
        JSON.stringify({message: `${count} rows updated`})
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
