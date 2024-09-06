import { Captcha } from '@/types/captcha'
import axios from 'axios'

export const getCaptcha = async () => {
    const response = await axios.get('https://hoadondientu.gdt.gov.vn:30000/captcha')
    const data = response.data as Captcha
    return data
}
