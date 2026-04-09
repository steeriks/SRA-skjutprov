import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import {
  STAGE_NAMES,
  HIT_TYPES,
  SHOT_COUNTS,
  PASS_THRESHOLD,
  WeaponType,
} from '../types'
import {
  calcStagePoints,
  calcStageTime,
  calcHitFactor,
  calcTotalHitFactor,
  formatTime,
  formatHF,
} from './sra'

interface PDFData {
  shooterName: string
  birthDate: string
  courseNumber: string
  club: string
  eventDate: string
  eventLocation: string
  judgeName: string
  judgeId: string
  judgePhone: string
  weaponType: WeaponType
  scores: number[][][] | undefined
  times: number[][] | undefined
  dqReason: string | undefined
}

export async function generatePDF(data: PDFData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await doc.embedFont(StandardFonts.Helvetica)

  const darkColor = rgb(0.05, 0.05, 0.1)
  const grayColor = rgb(0.4, 0.4, 0.4)
  const greenColor = rgb(0.1, 0.6, 0.2)
  const redColor = rgb(0.8, 0.1, 0.1)
  const accentColor = rgb(0.12, 0.16, 0.24)

  let y = height - 40

  // Header
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: accentColor })
  page.drawText('SRA SHOOTING TEST', {
    x: 40,
    y: height - 35,
    size: 20,
    font: boldFont,
    color: rgb(1, 1, 1),
  })
  page.drawText('Applied Reserve Military Shooting', {
    x: 40,
    y: height - 55,
    size: 11,
    font: regularFont,
    color: rgb(0.7, 0.8, 0.9),
  })
  page.drawText(`Generated: ${new Date().toLocaleDateString('en-GB')}`, {
    x: width - 200,
    y: height - 45,
    size: 9,
    font: regularFont,
    color: rgb(0.7, 0.8, 0.9),
  })

  y = height - 100

  // Shooter info section
  const drawSection = (title: string, yPos: number) => {
    page.drawText(title, {
      x: 40,
      y: yPos,
      size: 11,
      font: boldFont,
      color: darkColor,
    })
    page.drawLine({
      start: { x: 40, y: yPos - 5 },
      end: { x: width - 40, y: yPos - 5 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    })
    return yPos - 20
  }

  const drawField = (label: string, value: string, xPos: number, yPos: number, colWidth = 200) => {
    page.drawText(label + ':', {
      x: xPos,
      y: yPos,
      size: 8,
      font: regularFont,
      color: grayColor,
    })
    page.drawText(value || '—', {
      x: xPos,
      y: yPos - 13,
      size: 10,
      font: regularFont,
      color: darkColor,
    })
  }

  y = drawSection('SHOOTER INFORMATION', y)
  drawField('Name', data.shooterName, 40, y)
  drawField('Date of Birth', data.birthDate, 240, y)
  drawField('Course Number', data.courseNumber, 400, y)
  y -= 30
  drawField('Club', data.club, 40, y)
  drawField('Event Date', data.eventDate, 240, y)
  drawField('Location', data.eventLocation, 400, y)
  y -= 30
  drawField('Weapon Type', data.weaponType.toUpperCase(), 40, y)

  y -= 20
  y = drawSection('JUDGE INFORMATION', y)
  drawField('Judge Name', data.judgeName, 40, y)
  drawField('Judge ID', data.judgeId, 240, y)
  drawField('Phone', data.judgePhone, 400, y)
  y -= 40

  // DQ
  if (data.dqReason) {
    page.drawRectangle({
      x: 40,
      y: y - 10,
      width: width - 80,
      height: 30,
      color: rgb(1, 0.9, 0.9),
    })
    page.drawText(`DISQUALIFIED: ${data.dqReason}`, {
      x: 50,
      y: y,
      size: 12,
      font: boldFont,
      color: redColor,
    })
    y -= 40
  }

  // Stages table
  y = drawSection('STAGE RESULTS', y)

  // Table header
  const col0 = 40, col1 = 170, col2 = 220, col3 = 270, col4 = 310, col5 = 350, col6 = 390, col7 = 440, col8 = 490, col9 = 540
  const headerY = y

  page.drawRectangle({ x: 40, y: headerY - 5, width: width - 80, height: 18, color: rgb(0.9, 0.92, 0.95) })

  const headers = ['Stage', 'A', 'C', 'D', 'M', 'P', 'Pts', 'Time', 'HF']
  const cols = [col0, col1, col2, col3, col4, col5, col6, col7, col8]
  headers.forEach((h, i) => {
    page.drawText(h, { x: cols[i], y: headerY, size: 8, font: boldFont, color: darkColor })
  })

  y = headerY - 20

  let totalPts = 0
  let totalTime = 0

  for (let s = 0; s < 5; s++) {
    const stageScores = data.scores?.[s] ?? []
    const stageTimes = data.times?.[s] ?? []

    const counts: number[] = HIT_TYPES.map((_, h) => {
      let c = 0
      for (let t = 0; t < 2; t++) c += stageScores[h]?.[t] ?? 0
      return c
    })

    const pts = calcStagePoints(stageScores)
    const time = calcStageTime(stageTimes)
    const hf = calcHitFactor(pts, time)

    totalPts += pts
    totalTime += time

    if (s % 2 === 1) {
      page.drawRectangle({ x: 40, y: y - 5, width: width - 80, height: 18, color: rgb(0.97, 0.97, 0.97) })
    }

    const stageName = `S${s + 1}`
    page.drawText(stageName, { x: col0, y, size: 8, font: boldFont, color: darkColor })
    counts.forEach((c, i) => {
      page.drawText(String(c), { x: [col1, col2, col3, col4, col5][i], y, size: 8, font: regularFont, color: darkColor })
    })
    page.drawText(String(pts), { x: col6, y, size: 8, font: regularFont, color: darkColor })
    page.drawText(formatTime(time), { x: col7, y, size: 8, font: regularFont, color: darkColor })
    page.drawText(formatHF(hf), { x: col8, y, size: 8, font: regularFont, color: darkColor })

    // Times detail
    const timesStr = stageTimes.map(formatTime).join(' | ')
    page.drawText(`Times: ${timesStr}`, {
      x: col0 + 5,
      y: y - 12,
      size: 7,
      font: regularFont,
      color: grayColor,
    })

    y -= 30
  }

  // Totals
  page.drawLine({ start: { x: 40, y: y + 10 }, end: { x: width - 40, y: y + 10 }, thickness: 1.5, color: darkColor })

  const totalHF = calcHitFactor(totalPts, totalTime)
  const passed = !data.dqReason && totalHF >= PASS_THRESHOLD

  page.drawText('TOTAL', { x: col0, y, size: 9, font: boldFont, color: darkColor })
  page.drawText(String(totalPts), { x: col6, y, size: 9, font: boldFont, color: darkColor })
  page.drawText(formatTime(totalTime), { x: col7, y, size: 9, font: boldFont, color: darkColor })
  page.drawText(formatHF(totalHF), { x: col8, y, size: 9, font: boldFont, color: darkColor })

  y -= 30

  // Result box
  const resultColor = passed ? greenColor : redColor
  page.drawRectangle({ x: 40, y: y - 10, width: width - 80, height: 40, color: passed ? rgb(0.9, 1, 0.9) : rgb(1, 0.9, 0.9) })
  page.drawText(passed ? 'PASSED' : 'FAILED', {
    x: 60,
    y: y + 10,
    size: 18,
    font: boldFont,
    color: resultColor,
  })
  page.drawText(`Hit Factor: ${formatHF(totalHF)}  |  Threshold: ${PASS_THRESHOLD.toFixed(1)}`, {
    x: 200,
    y: y + 5,
    size: 11,
    font: regularFont,
    color: darkColor,
  })

  y -= 60

  // Signature line
  page.drawLine({ start: { x: 40, y: y }, end: { x: 220, y: y }, thickness: 1, color: grayColor })
  page.drawLine({ start: { x: 300, y: y }, end: { x: 555, y: y }, thickness: 1, color: grayColor })
  page.drawText('Shooter signature', { x: 40, y: y - 12, size: 8, font: regularFont, color: grayColor })
  page.drawText('Judge signature & stamp', { x: 300, y: y - 12, size: 8, font: regularFont, color: grayColor })

  // Footer
  page.drawText('SRA Shooting Test App | sra-test.app', {
    x: width / 2 - 80,
    y: 25,
    size: 8,
    font: regularFont,
    color: grayColor,
  })

  return doc.save()
}
