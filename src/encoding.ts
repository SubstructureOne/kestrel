export function b64encode(input: Uint8Array): string {
    return Buffer.from(input.buffer).toString('base64')
}

export function b64decode(input: string): Uint8Array {
    return Uint8Array.from(
        Buffer.from(input, 'base64')
    )
}
