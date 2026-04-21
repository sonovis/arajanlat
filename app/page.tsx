import { QuoteForm } from "@/components/quote-form"

export default function Page() {
  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Árajánlat generátor</h1>
        </div>
        <QuoteForm />
      </div>
    </main>
  )
}
