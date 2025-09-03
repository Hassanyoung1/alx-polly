import { NextRequest, NextResponse } from 'next/server'

// Mock poll data for v1 API testing
const mockPolls = [
  {
    id: '1',
    title: 'Favorite Programming Language',
    description: 'What is your favorite programming language?',
    options: [
      { id: '1', text: 'JavaScript', votes: 45, order_index: 0 },
      { id: '2', text: 'Python', votes: 38, order_index: 1 },
      { id: '3', text: 'TypeScript', votes: 42, order_index: 2 },
      { id: '4', text: 'Java', votes: 25, order_index: 3 }
    ],
    votes: [],
    total_votes: 150,
    is_active: true,
    expires_at: null,
    created_at: new Date().toISOString(),
    created_by: null
  },
  {
    id: '2', 
    title: 'Best Development Framework',
    description: 'Which framework do you prefer for web development?',
    options: [
      { id: '5', text: 'React', votes: 55, order_index: 0 },
      { id: '6', text: 'Vue.js', votes: 32, order_index: 1 },
      { id: '7', text: 'Angular', votes: 28, order_index: 2 },
      { id: '8', text: 'Svelte', votes: 15, order_index: 3 }
    ],
    votes: [],
    total_votes: 130,
    is_active: true,
    expires_at: null,
    created_at: new Date().toISOString(),
    created_by: null
  }
]

// GET /api/v1/poll/list - Get all polls (v1 RESTful endpoint)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const includeInactive = url.searchParams.get('includeInactive') === 'true'
    
    // Filter out inactive polls unless specifically requested
    const filteredPolls = includeInactive 
      ? mockPolls 
      : mockPolls.filter(poll => poll.is_active)
    
    // Return RESTful response format
    return NextResponse.json({
      success: true,
      message: 'Polls retrieved successfully',
      data: filteredPolls
    })
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    )
  }
}
