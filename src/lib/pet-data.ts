export interface Pet {
    id: string
    name: string
    breed: string
    age: number
    gender: "남아" | "여아"
    photo: string
    bio: string
    weight: number
    birthday: string
    personality: string[]
    healthStatus: {
        lastCheckup: string
        vaccination: string
        weight: "정상" | "과체중" | "저체중"
    }
    stats: {
        walks: number
        friends: number
        photos: number
    }
    isMemorial?: boolean
}

export const MY_PETS: Pet[] = [
    {
        id: "1",
        name: "초코",
        breed: "골든 리트리버",
        age: 2,
        gender: "남아",
        photo: "/golden-retriever.png",
        bio: "공놀이와 수영을 좋아하는 에너자이저 골댕이입니다. 사람을 너무 좋아해서 꼬리가 쉴 틈이 없어요! 🎾",
        weight: 28.5,
        birthday: "2022.03.15",
        personality: ["활발함", "친화력갑", "먹보"],
        healthStatus: {
            lastCheckup: "2023.12.10",
            vaccination: "완료",
            weight: "정상",
        },
        stats: {
            walks: 142,
            friends: 15,
            photos: 89,
        },
    },
    {
        id: "2",
        name: "루비",
        breed: "말티즈",
        age: 4,
        gender: "여아",
        photo: "/white-maltese-dog.jpg",
        bio: "새침하지만 내 가족에게만은 애교쟁이 루비예요. 산책보다는 카페에서 쉬는 걸 더 좋아한답니다. 🎀",
        weight: 3.2,
        birthday: "2020.08.20",
        personality: ["새침떼기", "깔끔쟁이", "주인바라기"],
        healthStatus: {
            lastCheckup: "2024.01.05",
            vaccination: "완료",
            weight: "정상",
        },
        stats: {
            walks: 86,
            friends: 8,
            photos: 124,
        },
    },
]

export interface Diary {
    id: string
    date: string
    image: string
    title: string
    content: string
    weather: string
    mood: string
}

export const AI_DIARIES: Diary[] = [
    {
        id: "diary-new-example",
        date: "2024-01-20",
        image: "/golden-retriever-playing-park.jpg",
        title: "새로운 AI 다이어리",
        content: "이것은 예시로 생성된 AI 다이어리입니다. 프로필 페이지 보관함에서 확인할 수 있어요.",
        weather: "맑음",
        mood: "행복",
    },
    {
        id: "diary1",
        date: "2024-01-15",
        image: "/golden-retriever-playing-park.jpg",
        title: "공원에서의 즐거운 하루",
        content:
            "오늘 초코는 공원에서 정말 행복한 시간을 보냈어요. 새로운 친구들을 만나고 신나게 뛰어놀았답니다. 햇살이 따스했고, 초코의 웃는 얼굴을 보니 저도 덩달아 행복해졌어요.",
        weather: "맑음",
        mood: "행복",
    },
    {
        id: "diary2",
        date: "2024-01-14",
        image: "/dog-running-grass.jpg",
        title: "달리기의 즐거움",
        content: "초코가 넓은 잔디밭에서 마음껏 달렸어요. 바람을 가르며 달리는 모습이 정말 자유로워 보였답니다.",
        weather: "흐림",
        mood: "신남",
    },
    {
        id: "diary3",
        date: "2024-01-10",
        image: "/golden-retriever.png",
        title: "편안한 오후",
        content: "오늘은 집에서 느긋하게 쉬는 날이에요. 초코도 소파에서 낮잠을 자며 편안한 시간을 보냈답니다.",
        weather: "비",
        mood: "평온",
    },
    {
        id: "diary4",
        date: "2024-01-08",
        image: "/corgi.jpg",
        title: "새로운 개인기",
        content: "오늘 코기가 '손'을 완벽하게 마스터했어요! 간식의 힘이 대단하네요.",
        weather: "맑음",
        mood: "뿌듯",
    },
    {
        id: "diary5",
        date: "2024-01-05",
        image: "/tabby-cat-sunbeam.png",
        title: "햇살 냥이",
        content: "창가에 들어오는 햇살 아래서 낮잠 자는 모습이 너무 평화로워 보여요.",
        weather: "맑음",
        mood: "나른",
    },
    {
        id: "diary6",
        date: "2024-01-03",
        image: "/dog-birthday-party.png",
        title: "생일 파티",
        content: "친구들을 초대해서 조촐한 생일 파티를 했어요. 케이크를 보고 눈이 반짝반짝!",
        weather: "눈",
        mood: "기쁨",
    },
    {
        id: "diary7",
        date: "2024-01-01",
        image: "/cat-in-box.jpg",
        title: "새해 첫 상자",
        content: "비싼 캣타워보다 택배 상자를 더 좋아하는 건 여전하네요.",
        weather: "맑음",
        mood: "호기심",
    },
    {
        id: "diary8",
        date: "2023-12-28",
        image: "/pomeranian.jpg",
        title: "미용 다녀온 날",
        content: "곰돌이 컷으로 미용하고 왔어요. 동글동글 너무 귀여워졌죠?",
        weather: "흐림",
        mood: "상쾌",
    },
    {
        id: "diary9",
        date: "2023-12-25",
        image: "/golden-retriever-playing-park.jpg",
        title: "크리스마스 산책",
        content: "산타 모자를 쓰고 산책을 나갔더니 인기 만점이었어요!",
        weather: "맑음",
        mood: "신남",
    },
    {
        id: "diary10",
        date: "2023-12-20",
        image: "/dog-running-grass.jpg",
        title: "눈밭 달리기",
        content: "올해 첫 눈을 밟아봤어요. 발자국 콩콩 찍으며 신나게 뛰어다녔답니다.",
        weather: "눈",
        mood: "행복",
    },
]