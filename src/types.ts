import {PostgrestFilterBuilder} from '@supabase/postgrest-js'
export type FilterOperator = Parameters<PostgrestFilterBuilder<any>['filter']>[1]

export type Env = {
    SUPABASE_JWT_SECRET: string,
    SUPABASE_URL: string,
    SUPABASE_ANON_KEY: string,
    SUPABASE_SERVICE_KEY: string,
    KESTREL_BUCKET: R2Bucket,
}

export type VerifyRequestJson = {
    jwt: string
}

export type DepositRequestJson = {
    jwt: string,
    userid: string,
    txnid?: string,
    amount: number
}

export type VerifySigantureJson = {
    jwt: string,
    message_b64: string,
    signature_b64: string,
    key_b64: string,
}

export type AddKeyJson = {
    jwt: string,
    key_b64: string,
    keytype: string
}

export type ListKeysJson = {
    jwt: string
}

export type DeleteKeyJson = {
    jwt: string,
    key_b64: string,
}

export type CreateTransactionJson = {
    jwt: string,
    fromuser: string,
    touser: string,
    amount: number
}

export type CreateRowFunctionDataJson = {
    jwt: string,
    userid: string,
    appid: string,
    data: object
}

export type QueryRowsFunctionDataJson = {
    jwt: string,
    userid: string,
    appid: string,
    column: string,
    operator: FilterOperator,
    value: string,
}

export type QueryRowsFunctionSingleResult = {
    id: string,
    data: object
}

export type QueryRowsFunctionResult = {
    queryinfo: QueryRowsFunctionDataJson,
    results: QueryRowsFunctionSingleResult[],
}

export type DeleteRowFunctionDataJson = {
    userid: string,
    appid: string,
    rowid: string,
}

export type UploadFileJsonData = {
    jwt: string,
    userid: string,
    appid: string,
    path: string
    filedata_b64: string
}

export type RetrieveFileJsonData = {
    jwt: string,
    userid: string,
    appid: string,
    path: string,
}
