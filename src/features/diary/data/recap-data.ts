export interface Recap {
    id: string
    period: string
    year: number
    coverImage: string
    totalMoments: number
    createdAt: string
    status: "generated" | "upcoming"
}

export const RECAPS: Recap[] = [
    {
        id: "1",
        period: "2024년 1-2월",
        year: 2024,
        coverImage: "/golden-retriever-playing-park.jpg",
        totalMoments: 45,
        createdAt: "2024.03.01",
        status: "generated",
    },
    {
        id: "2",
        period: "2023년 11-12월",
        year: 2023,
        coverImage: "/dog-running-grass.jpg",
        totalMoments: 38,
        createdAt: "2024.01.01",
        status: "generated",
    },
    {
        id: "3",
        period: "2023년 9-10월",
        year: 2023,
        coverImage: "/golden-retriever.png",
        totalMoments: 52,
        createdAt: "2023.11.01",
        status: "generated",
    },
    {
        id: "upcoming",
        period: "2024년 3-4월",
        year: 2024,
        coverImage: "",
        totalMoments: 0,
        createdAt: "2024.05.01",
        status: "upcoming",
    },
]
