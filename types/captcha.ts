export interface Captcha {
    key: string
    content: string
}

export interface AuthenInput {
    username: string
    password: string
    cvalue: string
    ckey: string
}
