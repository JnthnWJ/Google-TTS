import Image from "next/image"
import TextToSpeechApp from "@/components/text-to-speech-app"

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/background.png"
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
