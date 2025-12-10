import type { SVGProps } from "react"

export function KakaoIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.686 1.78 5.047 4.449 6.385-.145.522-.933 3.361-.964 3.566 0 0-.019.159.084.22.103.06.224.013.224.013.296-.041 3.428-2.24 3.97-2.625.728.103 1.482.158 2.237.158 5.523 0 10-3.463 10-7.717C22 6.463 17.523 3 12 3z" />
        </svg>
    )
}

export default KakaoIcon
