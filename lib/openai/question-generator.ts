import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GeneratedQuestion {
  question: string
  type: 'mcq' | 'coding' | 'practical'
  options?: string[] // For MCQ
  correctAnswer: string | number // For MCQ: index of correct option, for coding: expected output
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  testCases?: Array<{ // For coding questions
    input: string
    expectedOutput: string
  }>
}

interface QuestionGenerationParams {
  skill: string
  assessmentTitle: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionType: 'mcq' | 'coding' | 'practical' | 'mixed'
  numberOfQuestions: number
  topics?: string[]
}

export async function generateAssessmentQuestions(
  params: QuestionGenerationParams
): Promise<{ success: boolean; questions?: GeneratedQuestion[]; error?: string }> {
  try {
    const { skill, assessmentTitle, difficulty, questionType, numberOfQuestions, topics } = params

    // Build the prompt based on question type
    let prompt = `You are an expert assessment creator. Generate ${numberOfQuestions} ${difficulty} level questions for a "${assessmentTitle}" assessment focused on ${skill}.`

    if (topics && topics.length > 0) {
      prompt += `\n\nSpecific topics to cover: ${topics.join(', ')}`
    }

    if (questionType === 'mcq' || questionType === 'mixed') {
      prompt += `\n\nFor MCQ questions:
- Provide 4 options (A, B, C, D)
- Only ONE option should be correct
- Include an explanation for the correct answer
- Questions should test understanding, not just memorization
- Avoid obvious or trivial questions`
    }

    if (questionType === 'coding' || questionType === 'mixed') {
      prompt += `\n\nFor coding questions:
- Provide clear problem statements
- Include input/output examples
- Provide 3-5 test cases
- Difficulty should match ${difficulty} level
- Questions should be practical and relevant to ${skill}`
    }

    if (questionType === 'practical') {
      prompt += `\n\nFor practical questions:
- Provide scenario-based problems
- Include clear evaluation criteria
- Questions should require applying concepts to real-world situations`
    }

    prompt += `\n\nRespond with a JSON array of questions in this exact format:
[
  {
    "question": "Question text here",
    "type": "mcq" | "coding" | "practical",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Only for MCQ
    "correctAnswer": 0 | "Expected output text", // Index for MCQ, text for coding/practical
    "explanation": "Why this is the correct answer",
    "difficulty": "${difficulty}",
    "points": 10 | 20 | 30, // Based on difficulty: easy=10, medium=20, hard=30
    "testCases": [ // Only for coding questions
      {
        "input": "Sample input",
        "expectedOutput": "Expected output"
      }
    ]
  }
]

IMPORTANT:
1. Return ONLY valid JSON, no markdown formatting or code blocks
2. Ensure all questions are relevant to ${skill}
3. Match the difficulty level: ${difficulty}
4. Generate exactly ${numberOfQuestions} questions
5. For mixed type, include a variety of MCQ and coding questions`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4 mini for cost efficiency
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical assessment creator. You generate high-quality, relevant questions for skill assessments. Always respond with valid JSON only, no markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7, // Some creativity but consistent
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content

    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let parsedResponse: any
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      throw new Error('Invalid JSON response from OpenAI')
    }

    // Handle both array and object with questions array
    let questions: GeneratedQuestion[] = []
    if (Array.isArray(parsedResponse)) {
      questions = parsedResponse
    } else if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
      questions = parsedResponse.questions
    } else {
      throw new Error('Unexpected response format from OpenAI')
    }

    // Validate questions
    if (!questions || questions.length === 0) {
      throw new Error('No questions generated')
    }

    // Ensure all questions have required fields
    questions = questions.map((q, index) => ({
      ...q,
      type: q.type || (questionType === 'mixed' ? (index % 2 === 0 ? 'mcq' : 'coding') : questionType),
      difficulty: q.difficulty || difficulty,
      points: q.points || (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30),
    }))

    console.log(`✓ Generated ${questions.length} questions for ${assessmentTitle}`)

    return {
      success: true,
      questions,
    }
  } catch (error: any) {
    console.error('Error generating questions:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate questions',
    }
  }
}

// Generate questions for a specific topic/skill with customization
export async function generateQuestionsByTopic(
  skill: string,
  topic: string,
  count: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<{ success: boolean; questions?: GeneratedQuestion[]; error?: string }> {
  return generateAssessmentQuestions({
    skill,
    assessmentTitle: `${skill} - ${topic}`,
    difficulty,
    questionType: 'mcq',
    numberOfQuestions: count,
    topics: [topic],
  })
}

// Validate OpenAI API key
export async function validateOpenAIKey(): Promise<boolean> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment variables')
      return false
    }

    // Try a simple completion to validate the key
    await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5,
    })

    return true
  } catch (error) {
    console.error('OpenAI API key validation failed:', error)
    return false
  }
}
