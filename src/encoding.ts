export function b64encode(input: Uint8Array): string {
    // new TextDecoder().decode(input).toString()
    // return Buffer.from(input.buffer).toString('base64')
    let string = ''
    input.forEach(byte => { string += String.fromCharCode(byte)})
    return btoa(string)
}

export function b64decode(input: string): Uint8Array {
    // return Uint8Array.from(
    //     Buffer.from(input, 'base64')
    // )
    let string = atob(input)
    let buf = new ArrayBuffer(string.length)
    let bufView = new Uint8Array(buf)
    for (let i = 0; i < string.length; ++i) {
        bufView[i] = string.charCodeAt(i)
    }
    return bufView
}

export function b64length(input: string): number {
    return input.replace(/=+$/, '').length * 3 / 4
}
