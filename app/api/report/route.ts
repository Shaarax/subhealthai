import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function GET() {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // Letter
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const title = 'SubHealthAI Demo Report'
  page.drawText(title, { x: 72, y: 720, size: 24, font, color: rgb(0, 0, 0) })
  page.drawText('This is a placeholder export for demo purposes.', {
    x: 72, y: 690, size: 12, font
  })

  const bytes = await pdfDoc.save() // Uint8Array

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="subhealthai-demo.pdf"',
    },
  })
}
