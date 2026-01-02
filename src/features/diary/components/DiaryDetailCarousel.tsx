
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/shared/ui/carousel"

interface DiaryDetailCarouselProps {
    images: string[]
}

export default function DiaryDetailCarousel({ images }: DiaryDetailCarouselProps) {
    if (!images || images.length === 0) return null

    return (
        <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
                {images.map((image, index) => (
                    <CarouselItem key={index} className="h-full">
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <img
                                src={image}
                                alt={`Diary Image ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {images.length > 1 && (
                <>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                </>
            )}
        </Carousel>
    )
}
