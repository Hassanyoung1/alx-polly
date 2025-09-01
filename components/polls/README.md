# PollResultChart Component

A beautiful, interactive chart component for visualizing poll results in the ALX Polly application.

## Overview

The `PollResultChart` component provides an enhanced visualization of poll results with colorful progress bars, statistics, and user-friendly displays. It's designed to complement the existing `PollVoting` component by offering a dedicated results view.

## Features

- 🎨 **Colorful Visualization** - 8 distinct colors for different poll options
- 📊 **Progress Bars** - Animated horizontal bars showing vote percentages
- 📈 **Statistics Summary** - Total votes, options count, average votes per option
- 🏆 **Winner Display** - Highlights the leading option
- 👤 **User Vote Highlighting** - Shows which option the current user voted for
- 📱 **Responsive Design** - Works on mobile and desktop
- 🚫 **Empty State** - Graceful handling of polls with no votes
- 🕐 **Status Badges** - Shows Active, Expired, or Inactive status

## Usage

### Basic Usage

```tsx
import { PollResultChart } from "@/components/polls/poll-result-chart"

function MyComponent() {
  return (
    <PollResultChart poll={poll} />
  )
}
```

### With User Vote

```tsx
<PollResultChart 
  poll={poll} 
  userVote={userVote} 
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `poll` | `Poll` | ✅ | The poll object containing options and votes |
| `userVote` | `Vote` | ❌ | The current user's vote (if any) |
| `showVotingInterface` | `boolean` | ❌ | Future feature for voting controls |

## Component Structure

The component is organized into several sections:

1. **Header** - Poll title, description, and status badges
2. **Chart Visualization** - Color-coded progress bars with percentages
3. **Statistics Grid** - Summary metrics in a 4-column layout
4. **Winner Announcement** - Highlighted leading option
5. **User Vote Status** - Shows user's selected option
6. **Footer** - Creation date and expiration info

## Styling

The component follows ALX Polly's design system:

- **Colors**: Uses a palette of 8 distinct colors (blue, green, yellow, purple, pink, indigo, red, teal)
- **Typography**: Follows existing font weights and sizes
- **Spacing**: Consistent with other poll components
- **Cards**: Uses Shadcn UI Card component
- **Badges**: Matches existing badge styling for poll status

## Integration

### In Individual Poll Pages

The component is already integrated into `/app/polls/[id]/page.tsx` and will show automatically when a poll has votes.

```tsx
// Shows both voting interface and detailed chart
<PollVoting poll={poll} userVote={userVote} pollId={id} />
{poll.votes.length > 0 && (
  <PollResultChart poll={poll} userVote={userVote} />
)}
```

### Standalone Usage

For results-only pages or dashboards:

```tsx
import { PollResultChart } from "@/components/polls/poll-result-chart"

export default function ResultsPage() {
  return (
    <div className="container mx-auto p-4">
      <PollResultChart poll={poll} userVote={userVote} />
    </div>
  )
}
```

## Color Coding

Options are automatically assigned colors based on their position:

1. Blue (`bg-blue-500`)
2. Green (`bg-green-500`) 
3. Yellow (`bg-yellow-500`)
4. Purple (`bg-purple-500`)
5. Pink (`bg-pink-500`)
6. Indigo (`bg-indigo-500`)
7. Red (`bg-red-500`)
8. Teal (`bg-teal-500`)

Colors cycle if there are more than 8 options.

## Data Requirements

The component expects poll data in this format:

```typescript
interface Poll {
  id: string
  title: string
  description?: string
  created_at: Date | string
  expires_at?: Date | string
  is_active: boolean
  options: PollOption[]
  votes: Vote[]
}
```

## Examples

See `/examples/poll-result-chart-example.tsx` for comprehensive usage examples including:

- Chart with user vote
- Chart without user vote  
- Empty poll with no votes

## Accessibility

- Semantic HTML structure
- Color indicators paired with text labels
- Responsive design for various screen sizes
- High contrast ratios for readability

## Future Enhancements

- Animation transitions for vote count changes
- Export functionality (PDF, image)
- More chart types (pie chart, bar chart)
- Interactive tooltips
- Real-time updates via WebSocket

## Dependencies

- React 18+
- Next.js 15+
- Tailwind CSS
- Shadcn UI components (Card, Badge)
- ALX Polly types (`Poll`, `Vote`, `PollOption`)
