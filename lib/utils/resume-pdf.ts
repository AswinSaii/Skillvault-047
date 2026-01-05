import { jsPDF } from "jspdf"
import type { Certificate } from "@/lib/firebase/certificates"

interface SkillData {
  skill: string
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  certificates: Certificate[]
  averageScore: number
  assessmentsTaken: number
}

interface ResumeData {
  studentName: string
  studentEmail: string
  collegeName: string
  skills: SkillData[]
  totalCertificates: number
  overallAverage: number
}

/**
 * Generate a skill-only resume PDF (no marks/CGPA - recruiter friendly)
 */
export async function generateSkillResumePDF(data: ResumeData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const width = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage()
      yPosition = 20
      return true
    }
    return false
  }

  // Header - Name
  pdf.setFontSize(24)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(30, 41, 59)
  pdf.text(data.studentName, width / 2, yPosition, { align: "center" })
  yPosition += 8

  // Contact Info
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(100, 116, 139)
  pdf.text(data.studentEmail, width / 2, yPosition, { align: "center" })
  yPosition += 5
  pdf.text(data.collegeName + " (Verified)", width / 2, yPosition, { align: "center" })
  yPosition += 10

  // Divider
  pdf.setDrawColor(203, 213, 225)
  pdf.setLineWidth(0.5)
  pdf.line(20, yPosition, width - 20, yPosition)
  yPosition += 10

  // Professional Summary
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(59, 130, 246)
  pdf.text("SKILL-VERIFIED PROFILE", 20, yPosition)
  yPosition += 8

  pdf.setFontSize(9)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(71, 85, 105)
  const summaryText = `Verified skill profile with ${data.totalCertificates} certified assessments. All skills validated through SkillVault platform under ${data.collegeName}. Overall performance average: ${data.overallAverage}%.`
  const summaryLines = pdf.splitTextToSize(summaryText, width - 40)
  pdf.text(summaryLines, 20, yPosition)
  yPosition += summaryLines.length * 5 + 5

  // Skills Section
  checkPageBreak(20)
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(59, 130, 246)
  pdf.text("VERIFIED SKILLS", 20, yPosition)
  yPosition += 10

  // Sort skills by level and average score
  const sortedSkills = [...data.skills].sort((a, b) => {
    const levelOrder = { Expert: 4, Advanced: 3, Intermediate: 2, Beginner: 1 }
    const levelDiff = levelOrder[b.level] - levelOrder[a.level]
    if (levelDiff !== 0) return levelDiff
    return b.averageScore - a.averageScore
  })

  sortedSkills.forEach((skillData, index) => {
    checkPageBreak(25)

    // Skill name and level
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(30, 41, 59)
    pdf.text(skillData.skill, 20, yPosition)

    // Level badge
    const levelColors = {
      Expert: { bg: [34, 197, 94], text: [255, 255, 255] },
      Advanced: { bg: [59, 130, 246], text: [255, 255, 255] },
      Intermediate: { bg: [251, 146, 60], text: [255, 255, 255] },
      Beginner: { bg: [148, 163, 184], text: [255, 255, 255] },
    }
    const color = levelColors[skillData.level]
    
    pdf.setFillColor(color.bg[0], color.bg[1], color.bg[2])
    pdf.rect(width - 50, yPosition - 4, 30, 5, "F")
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(color.text[0], color.text[1], color.text[2])
    pdf.text(skillData.level, width - 35, yPosition, { align: "center" })
    yPosition += 6

    // Skill details
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(100, 116, 139)
    pdf.text(`• ${skillData.assessmentsTaken} assessments completed`, 25, yPosition)
    yPosition += 4
    pdf.text(`• Average score: ${skillData.averageScore}%`, 25, yPosition)
    yPosition += 4
    pdf.text(`• ${skillData.certificates.length} certificate${skillData.certificates.length !== 1 ? 's' : ''} earned`, 25, yPosition)
    yPosition += 6

    // Certificate IDs (if any)
    if (skillData.certificates.length > 0) {
      pdf.setFontSize(7)
      pdf.setTextColor(148, 163, 184)
      const certIds = skillData.certificates.map(c => c.certificateId).join(", ")
      const certLines = pdf.splitTextToSize(`Certificates: ${certIds}`, width - 50)
      pdf.text(certLines, 25, yPosition)
      yPosition += certLines.length * 3 + 5
    }

    yPosition += 3
  })

  // Certifications Section
  checkPageBreak(20)
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(59, 130, 246)
  pdf.text("CERTIFICATIONS", 20, yPosition)
  yPosition += 10

  // Group certificates by skill
  const allCertificates = data.skills.flatMap(s => s.certificates)
  const recentCertificates = allCertificates
    .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())
    .slice(0, 10) // Show top 10 recent

  recentCertificates.forEach((cert) => {
    checkPageBreak(15)

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(30, 41, 59)
    pdf.text(cert.assessmentTitle, 20, yPosition)
    yPosition += 5

    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(100, 116, 139)
    pdf.text(`Score: ${cert.percentage}%`, 25, yPosition)
    pdf.text(`Issued: ${new Date(cert.issuedDate).toLocaleDateString()}`, 70, yPosition)
    pdf.text(`ID: ${cert.certificateId}`, 120, yPosition)
    yPosition += 6
  })

  // Footer
  yPosition = pageHeight - 15
  pdf.setFontSize(7)
  pdf.setTextColor(148, 163, 184)
  pdf.text("This resume contains only verified skills. All certifications are verifiable at:", width / 2, yPosition, { align: "center" })
  yPosition += 3
  pdf.text("https://skillvault.app/verify/{certificate-id}", width / 2, yPosition, { align: "center" })
  yPosition += 4
  pdf.setFontSize(6)
  pdf.text("Generated by SkillVault - Skill Assessment & Certification Platform", width / 2, yPosition, { align: "center" })

  return pdf.output("blob")
}

/**
 * Download skill resume as PDF
 */
export async function downloadSkillResume(data: ResumeData): Promise<void> {
  const blob = await generateSkillResumePDF(data)
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  const fileName = `${data.studentName.replace(/\s+/g, '_')}_SkillResume.pdf`
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Prepare resume data from student's certificates and attempts
 */
export function prepareResumeData(
  studentName: string,
  studentEmail: string,
  collegeName: string,
  certificates: Certificate[]
): ResumeData {
  // Group certificates by skill
  const skillMap = new Map<string, Certificate[]>()
  
  certificates.forEach((cert) => {
    if (!skillMap.has(cert.skill)) {
      skillMap.set(cert.skill, [])
    }
    skillMap.get(cert.skill)!.push(cert)
  })

  // Calculate skill data
  const skills: SkillData[] = []
  
  skillMap.forEach((certs, skill) => {
    const scores = certs.map(c => c.percentage)
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    
    // Determine skill level based on average score
    let level: SkillData["level"]
    if (averageScore >= 90) level = "Expert"
    else if (averageScore >= 80) level = "Advanced"
    else if (averageScore >= 70) level = "Intermediate"
    else level = "Beginner"

    skills.push({
      skill,
      level,
      certificates: certs,
      averageScore,
      assessmentsTaken: certs.length,
    })
  })

  const overallAverage = certificates.length > 0
    ? Math.round(certificates.reduce((sum, c) => sum + c.percentage, 0) / certificates.length)
    : 0

  return {
    studentName,
    studentEmail,
    collegeName,
    skills,
    totalCertificates: certificates.length,
    overallAverage,
  }
}
