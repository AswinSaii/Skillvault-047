import { jsPDF } from "jspdf"
import QRCode from "qrcode"
import type { Certificate } from "@/lib/firebase/certificates"

/**
 * Generate a certificate PDF with QR code
 */
export async function generateCertificatePDF(certificate: Certificate): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  const width = pdf.internal.pageSize.getWidth()
  const height = pdf.internal.pageSize.getHeight()

  // Background gradient effect (simulated with rectangles)
  pdf.setFillColor(240, 245, 255)
  pdf.rect(0, 0, width, height, "F")

  // Border
  pdf.setLineWidth(2)
  pdf.setDrawColor(59, 130, 246) // Primary blue
  pdf.rect(10, 10, width - 20, height - 20, "S")

  // Inner border
  pdf.setLineWidth(0.5)
  pdf.setDrawColor(148, 163, 184)
  pdf.rect(15, 15, width - 30, height - 30, "S")

  // Header - SkillVault Logo Text
  pdf.setFontSize(32)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(59, 130, 246)
  pdf.text("SkillVault", width / 2, 35, { align: "center" })

  // Subtitle
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(100, 116, 139)
  pdf.text("Skill Assessment & Certification Platform", width / 2, 45, { align: "center" })

  // Certificate Title
  pdf.setFontSize(28)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(30, 41, 59)
  pdf.text("Certificate of Achievement", width / 2, 65, { align: "center" })

  // Divider line
  pdf.setLineWidth(0.5)
  pdf.setDrawColor(203, 213, 225)
  pdf.line(50, 70, width - 50, 70)

  // This certifies that
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(100, 116, 139)
  pdf.text("This certifies that", width / 2, 80, { align: "center" })

  // Student Name (large, bold)
  pdf.setFontSize(24)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(30, 41, 59)
  pdf.text(certificate.studentName, width / 2, 92, { align: "center" })

  // Achievement text
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(100, 116, 139)
  pdf.text("has successfully completed the assessment in", width / 2, 102, { align: "center" })

  // Assessment/Skill Title
  pdf.setFontSize(18)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(59, 130, 246)
  pdf.text(certificate.assessmentTitle || certificate.skill, width / 2, 112, { align: "center" })

  // Score
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(34, 197, 94) // Green for score
  pdf.text(`Score: ${certificate.percentage}%`, width / 2, 122, { align: "center" })

  // College Name with Verified Badge
  pdf.setFontSize(11)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(100, 116, 139)
  pdf.text(`Issued by ${certificate.collegeName}`, width / 2, 132, { align: "center" })
  
  // Verified badge (✓ Verified)
  pdf.setFontSize(9)
  pdf.setTextColor(34, 197, 94)
  pdf.text("✓ Verified Institution", width / 2, 138, { align: "center" })

  // Date
  const formattedDate = new Date(certificate.issuedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  pdf.setFontSize(10)
  pdf.setTextColor(100, 116, 139)
  pdf.text(`Issued on ${formattedDate}`, width / 2, 148, { align: "center" })

  // Generate QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(certificate.verificationUrl, {
      width: 150,
      margin: 1,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    })

    // Add QR code to PDF (bottom right)
    const qrSize = 30
    pdf.addImage(qrDataUrl, "PNG", width - 50, height - 50, qrSize, qrSize)

    // QR Code label
    pdf.setFontSize(8)
    pdf.setTextColor(100, 116, 139)
    pdf.text("Scan to verify", width - 35, height - 16, { align: "center" })
  } catch (error) {
    console.error("Error generating QR code:", error)
  }

  // Certificate ID (bottom left)
  pdf.setFontSize(9)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(100, 116, 139)
  pdf.text(`Certificate ID: ${certificate.certificateId}`, 20, height - 20)

  // Verification URL (bottom center, small)
  pdf.setFontSize(7)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(148, 163, 184)
  pdf.text(certificate.verificationUrl, width / 2, height - 12, { align: "center" })

  // Authenticity statement
  pdf.setFontSize(8)
  pdf.setTextColor(148, 163, 184)
  pdf.text(
    "This certificate is digitally verifiable and issued by a verified institution.",
    width / 2,
    height - 20,
    { align: "center" }
  )

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
