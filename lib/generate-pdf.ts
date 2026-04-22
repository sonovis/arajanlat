export async function generateAndDownloadPdf(data: QuoteData) {
  const res = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("PDF generation failed");

  const blob = await res.blob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = data.fajlnev;
  a.click();

  URL.revokeObjectURL(url);
}