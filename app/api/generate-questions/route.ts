import { NextRequest, NextResponse } from 'next/server'
import { generateAssessmentQuestions } from '@/lib/openai/question-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skill, assessmentTitle, difficulty, questionType, numberOfQuestions, topics } = body

    // Validate required fields
    if (!skill || !assessmentTitle || !difficulty || !questionType || !numberOfQuestions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate numberOfQuestions
    if (numberOfQuestions < 1 || numberOfQuestions > 50) {
      return NextResponse.json(
        { success: false, error: 'Number of questions must be between 1 and 50' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file',
        },
        { status: 500 }
      )
    }

    console.log(`Generating ${numberOfQuestions} questions for ${assessmentTitle}...`)

    // Generate questions
    const result = await generateAssessmentQuestions({
      skill,
      assessmentTitle,
      difficulty,
      questionType,
      numberOfQuestions,
      topics,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate questions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      questions: result.questions,
      count: result.questions?.length || 0,
    })
  } catch (error: any) {
    console.error('API Error generating questions:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
