import Image from "next/image"
import TextToSpeechApp from "@/components/text-to-speech-app"

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <Image
          src="https://i0.wp.com/mrmacintosh.com/wp-content/uploads/2024/08/Screenshot-2024-08-05-at-5.37.59%E2%80%AFPM.png?w=1680&ssl=1"
          alt="Apple Vision Pro Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="container mx-auto px-4 py-8 h-screen flex items-center justify-center">
        <TextToSpeechApp />
      </div>
    </main>
  )
}
