# Claude Integration Test for Note Coach

This script tests the Claude API integration with our custom tools to verify the end-to-end workflow.

## Test Scenarios

1. **Basic Note Saving**: Test Claude's ability to save and categorize notes
2. **Project Context Retrieval**: Test Claude's ability to fetch project history
3. **Socratic Coaching**: Test Claude's coaching session capabilities
4. **Connection Discovery**: Test Claude's ability to find relationships between notes

## Running the Tests

```bash
npm run test:claude
```

## Manual Testing with Claude

You can test Claude integration manually by running the server and using these prompts with Claude:

### Test 1: Save a Note
```
I have a note-taking app with custom tools. Please save this note using the save_note tool: 

"I want to start running 3 times a week to prepare for a 5K race in 3 months. Need to research proper training schedules and running shoes."

The save_note tool is available at: http://localhost:3000/tools/save_note
```

### Test 2: Get Project Context
```
Now retrieve all notes for the "fitness" project using the get_project_context tool:

Tool endpoint: http://localhost:3000/tools/get_project_context
```

### Test 3: Start Coaching Session
```
Start a coaching session for the fitness project focusing on goal setting:

Tool endpoint: http://localhost:3000/tools/start_coaching_session
```

## Expected Claude Behavior

When properly integrated, Claude should:

1. **Understand the Tools**: Recognize the available tools and their purposes
2. **Make API Calls**: Successfully call the tool endpoints with proper parameters
3. **Analyze Responses**: Process tool responses and provide meaningful insights
4. **Generate Questions**: Create thoughtful Socratic questions based on note content
5. **Connect Ideas**: Identify relationships between different notes and projects

## Integration Checklist

- [ ] Claude can call save_note tool
- [ ] Claude analyzes note content and improves project detection
- [ ] Claude can retrieve project context
- [ ] Claude generates relevant coaching questions
- [ ] Claude identifies connections between notes
- [ ] Claude maintains conversation context across tool calls

## Troubleshooting

### Common Issues

1. **Tool Not Found**: Ensure server is running on correct port
2. **CORS Errors**: Check CORS configuration in server.js
3. **Database Errors**: Verify SQLite database is created properly
4. **API Key Issues**: Check Claude API key in .env file

### Debug Steps

1. Test tool endpoints directly with curl
2. Check server logs for errors
3. Verify database schema is correct
4. Test with simple note content first

## Success Criteria

The integration is successful when:
- Claude can save notes with better categorization than the basic keyword matching
- Claude generates contextual coaching questions based on note history
- Claude discovers non-obvious connections between notes
- The conversation flow feels natural and helpful for the user
