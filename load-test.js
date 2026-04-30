import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
    stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 500 },
    { duration: '2m', target: 500 },
    { duration: '30s', target: 0 },
    ],
    thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
    },
}

const BASE_URL = 'https://thitructuyen-tralien.vercel.app'

export default function () {
    // Test trang chủ
    const home = http.get(BASE_URL)
    check(home, { 'Trang chủ OK': r => r.status === 200 })

    // Test trang đăng ký (không cần auth)
    const register = http.get(`${BASE_URL}/dang-ky`)
    check(register, { 'Trang đăng ký OK': r => r.status === 200 })

    // Test trang đăng nhập
    const login = http.get(`${BASE_URL}/dang-nhap`)
    check(login, { 'Trang đăng nhập OK': r => r.status === 200 })

    sleep(1)
}