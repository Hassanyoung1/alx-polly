// Test script to check delete button functionality
const testDeleteButton = async () => {
  // Simulate a delete action call
  try {
    // Test the deletePoll function directly
    const response = await fetch('/api/v1/polls', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Polls available:', data.polls?.length || 0);
      
      if (data.polls && data.polls.length > 0) {
        const firstPoll = data.polls[0];
        console.log('First poll ID:', firstPoll.id);
        console.log('First poll title:', firstPoll.title);
        
        // Test delete endpoint
        const deleteResponse = await fetch(`/api/v1/polls/${firstPoll.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Delete response status:', deleteResponse.status);
        const deleteResult = await deleteResponse.json();
        console.log('Delete result:', deleteResult);
      }
    } else {
      console.error('Failed to fetch polls:', response.status);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testDeleteButton();
