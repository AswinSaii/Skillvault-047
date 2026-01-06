import { jsPDF } from "jspdf"
import QRCode from "qrcode"
import type { Certificate } from "@/lib/firebase/certificates"

/**
 * Generate a certificate PDF matching the official template design
 */
export async function generateCertificatePDF(certificate: Certificate): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const width = pdf.internal.pageSize.getWidth()
  const height = pdf.internal.pageSize.getHeight()

  // Light beige background
  pdf.setFillColor(250, 245, 235) // Light beige
  pdf.rect(0, 0, width, height, "F")

  // Decorative corner borders (light brown)
  const borderColor = [139, 115, 85] // Light brown RGB
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
  pdf.setLineWidth(1)
  
  // Top-left corner decoration
  const cornerSize = 15
  pdf.line(20, 20, 20 + cornerSize, 20)
  pdf.line(20, 20, 20, 20 + cornerSize)
  pdf.line(20, 20 + cornerSize, 20 + cornerSize * 0.7, 20 + cornerSize)
  pdf.line(20 + cornerSize * 0.7, 20 + cornerSize, 20 + cornerSize * 0.7, 20 + cornerSize * 0.7)
  
  // Top-right corner decoration
  pdf.line(width - 20, 20, width - 20 - cornerSize, 20)
  pdf.line(width - 20, 20, width - 20, 20 + cornerSize)
  pdf.line(width - 20, 20 + cornerSize, width - 20 - cornerSize * 0.7, 20 + cornerSize)
  pdf.line(width - 20 - cornerSize * 0.7, 20 + cornerSize, width - 20 - cornerSize * 0.7, 20 + cornerSize * 0.7)
  
  // Bottom-left corner decoration
  pdf.line(20, height - 20, 20 + cornerSize, height - 20)
  pdf.line(20, height - 20, 20, height - 20 - cornerSize)
  pdf.line(20, height - 20 - cornerSize, 20 + cornerSize * 0.7, height - 20 - cornerSize)
  pdf.line(20 + cornerSize * 0.7, height - 20 - cornerSize, 20 + cornerSize * 0.7, height - 20 - cornerSize * 0.7)
  
  // Bottom-right corner decoration
  pdf.line(width - 20, height - 20, width - 20 - cornerSize, height - 20)
  pdf.line(width - 20, height - 20, width - 20, height - 20 - cornerSize)
  pdf.line(width - 20, height - 20 - cornerSize, width - 20 - cornerSize * 0.7, height - 20 - cornerSize)
  pdf.line(width - 20 - cornerSize * 0.7, height - 20 - cornerSize, width - 20 - cornerSize * 0.7, height - 20 - cornerSize * 0.7)

  // Main border
  pdf.setLineWidth(2)
  pdf.setDrawColor(0, 0, 0) // Black
  pdf.rect(15, 15, width - 30, height - 30, "S")

  // "CERTIFICATE" title - large, bold, black, serif-like
  pdf.setFontSize(42)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(0, 0, 0) // Black
  pdf.text("CERTIFICATE", width / 2, 50, { align: "center" })

  // "OF COMPLETION" subtitle - smaller, light brown, spaced letters
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(borderColor[0], borderColor[1], borderColor[2]) // Light brown
  const ofCompletionText = "O F   C O M P L E T I O N"
  pdf.text(ofCompletionText, width / 2, 58, { align: "center" })

  // "THIS CERTIFICATE IS AWARDED TO :" text
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(0, 0, 0) // Black
  pdf.text("THIS CERTIFICATE IS AWARDED TO :", width / 2, 80, { align: "center" })

  // Student Name - large, elegant script-like font with underline
  pdf.setFontSize(32)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(0, 0, 0) // Black
  const studentNameY = 100
  pdf.text(certificate.studentName, width / 2, studentNameY, { align: "center" })
  
  // Underline for student name (light brown)
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
  pdf.setLineWidth(0.5)
  const nameWidth = pdf.getTextWidth(certificate.studentName)
  pdf.line((width - nameWidth) / 2, studentNameY + 2, (width + nameWidth) / 2, studentNameY + 2)

  // Achievement text
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(0, 0, 0) // Black
  const courseName = certificate.assessmentTitle || certificate.skill
  const achievementText = `HAS SUCCESSFULLY COMPLETED ${courseName.toUpperCase()} AND EARNED A WITH A SCORE OF ${certificate.percentage}%, DEMONSTRATING PROFICIENCY IN THE EVALUATED SKILLS.`
  const achievementLines = pdf.splitTextToSize(achievementText, width - 60)
  let achievementY = 120
  achievementLines.forEach((line: string) => {
    pdf.text(line, width / 2, achievementY, { align: "center" })
    achievementY += 6
  })

  // Bottom section - QR Code (left), Medal (center), Signature (right)
  const bottomY = height - 50
  const leftX = 25
  const centerX = width / 2
  const rightX = width - 25

  // Generate QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(certificate.verificationUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })

    // QR Code on the left
    const qrSize = 25
    pdf.addImage(qrDataUrl, "PNG", leftX, bottomY - qrSize - 8, qrSize, qrSize)

    // Certificate ID below QR code
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0) // Black
    pdf.text(`CERTIFICATE ID: ${certificate.certificateId}`, leftX, bottomY + 2, { align: "left" })
  } catch (error) {
    console.error("Error generating QR code:", error)
    // Fallback: just show certificate ID
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0)
    pdf.text(`CERTIFICATE ID: ${certificate.certificateId}`, leftX, bottomY, { align: "left" })
  }

  // Medal/Ribbon icon in center (drawn as a simple medal shape)
  const medalSize = 18
  const medalY = bottomY - medalSize / 2
  
  // Draw medal shape (circle with ribbon)
  // Outer circle (gold border)
  pdf.setDrawColor(218, 165, 32) // Gold border
  pdf.setLineWidth(1.5)
  pdf.circle(centerX, medalY, medalSize / 2, "S")
  
  // Inner circle (gold fill)
  pdf.setFillColor(255, 215, 0) // Gold color
  pdf.circle(centerX, medalY, medalSize / 2 - 1, "F")
  
  // Ribbon at bottom
  pdf.setFillColor(139, 0, 0) // Dark red ribbon
  pdf.rect(centerX - medalSize / 3, medalY + medalSize / 2 - 3, medalSize * 2 / 3, 5, "F")
  
  // Add star or "A" for Award in the medal
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(0, 0, 0)
  pdf.text("★", centerX, medalY + 1, { align: "center" })

  // Signature area on the right
  const signatureY = bottomY - 15
  
  // Signature line (stylized wavy signature)
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(1)
  // Draw a stylized signature curve
  pdf.moveTo(rightX - 25, signatureY - 3)
  for (let i = 0; i < 25; i++) {
    const x = rightX - 25 + (i * 1.2)
    const y = signatureY - 3 + Math.sin(i * 0.4) * 1.5 + Math.cos(i * 0.2) * 0.8
    pdf.lineTo(x, y)
  }
  pdf.stroke()
  
  // Underline for signature (light brown)
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
  pdf.setLineWidth(0.5)
  pdf.line(rightX - 25, signatureY, rightX + 5, signatureY)

  // "PRINCIPAL" text
  pdf.setFontSize(8)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(0, 0, 0)
  pdf.text("PRINCIPAL", rightX, signatureY + 3, { align: "center" })

  // College name below principal
  pdf.setFontSize(7)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(0, 0, 0)
  const collegeNameLines = pdf.splitTextToSize(certificate.collegeName.toUpperCase(), 30)
  let collegeY = signatureY + 8
  collegeNameLines.forEach((line: string) => {
    pdf.text(line, rightX, collegeY, { align: "center" })
    collegeY += 4
  })

  return pdf.output("blob")
}

/**
 * Download certificate as PDF
 */
export async function downloadCertificatePDF(certificate: Certificate): Promise<void> {
  const blob = await generateCertificatePDF(certificate)
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `Certificate_${certificate.certificateId}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
