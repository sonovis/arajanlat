import { QuoteForm } from "@/components/quote-form"
import Image from "next/image";

export default function Page() {
  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 flex flex-col items-center gap-2">
          <img
            src="/assets/logo-text-color.svg"
            alt="logo"
            className="w-auto mx-auto"
          />

          <h1 className="text-3xl font-bold tracking-tight">
            Árajánlat generátor
          </h1>
        </div>
        <QuoteForm />
      </div>
    </main>
  )
}
