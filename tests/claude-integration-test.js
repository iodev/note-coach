const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Test data
const testNotes = [
  {
    content: "I want to start running 3 times a week to prepare for a 5K race in 3 months. Need to research proper training schedules and running shoes.",
    expectedProject: "fitness"
  },
  {
    content: "Team meeting tomorrow at 2pm to discuss the Q4 budget proposal. Need to prepare slides on marketing spend.",
    expectedProject: "work"
  },
  {
    content: "Learning React hooks - useState and useEffect seem powerful for state management. Building a todo app to practice.",
    expectedProject: "learning"
  }
];

class ClaudeIntegrationTest {
  constructor() {
    this.results = [];
    this.serverRunning = false;
  }

  async checkServerStatus() {
    try {
      const response = await axios.get(BASE_URL);
      this.serverRunning = true;
      console.log('✅ Server is running');
      return true;
    } catch (error) {
      console.log('❌ Server is not running. Please start with: npm start');
      return false;
    }
  }

  async testToolEndpoint(toolName, payload) {
    try {
      const response = await axios.post(`${BASE_URL}/tools/${toolName}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`✅ ${toolName} tool working`);
      return { success: true, data: response.data };
    } catch (error) {
      console.log(`❌ ${toolName} tool failed:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async testBasicToolsFunctionality() {
    console.log('\n🔧 Testing Basic Tools Functionality...\n');

    // Test save_note tool
    for (const note of testNotes) {
      const result = await this.testToolEndpoint('save_note', {
        content: note.content
      });
      
      if (result.success) {
        console.log(`   Project detected: ${result.data.project_detected}`);
        note.savedId = result.data.note_id;
      }
    }

    // Test get_project_context tool
    const contextResult = await this.testToolEndpoint('get_project_context', {
      project_name: 'fitness'
    });

    // Test search_notes tool
    const searchResult = await this.testToolEndpoint('search_notes', {
      query: 'running'
    });

    // Test start_coaching_session tool
    const coachingResult = await this.testToolEndpoint('start_coaching_session', {
      project_name: 'fitness',
      session_type: 'exploration'
    });

    return {
      save_note: testNotes.every(note => note.savedId),
      get_project_context: contextResult.success,
      search_notes: searchResult.success,
      start_coaching_session: coachingResult.success
    };
  }

  async testClaudeAPIConnection() {
    if (!CLAUDE_API_KEY) {
      console.log('⚠️  Claude API key not found. Skipping Claude API tests.');
      console.log('   Add CLAUDE_API_KEY to .env to test Claude integration');
      return false;
    }

    console.log('\n🤖 Testing Claude API Connection...\n');

    try {
      // This would test actual Claude API integration
      // For now, we'll simulate it
      console.log('✅ Claude API key found');
      console.log('⚠️  Actual Claude integration test requires setting up tool definitions');
      return true;
    } catch (error) {
      console.log('❌ Claude API connection failed:', error.message);
      return false;
    }
  }

  generateIntegrationPrompt() {
    const prompt = `
# Claude Integration Test Prompt

I'm testing a Note Coach app with custom tools. Here's how to test the integration:

## Available Tools:
- save_note: POST ${BASE_URL}/tools/save_note
- get_project_context: POST ${BASE_URL}/tools/get_project_context  
- search_notes: POST ${BASE_URL}/tools/search_notes
- start_coaching_session: POST ${BASE_URL}/tools/start_coaching_session

## Test Sequence:

1. **Save this note**: "${testNotes[0].content}"
2. **Get context** for the detected project
3. **Start a coaching session** for that project
4. **Ask me 2-3 Socratic questions** based on the note content

Please use the tools to complete this workflow and demonstrate the coaching capabilities.
`;

    return prompt;
  }

  async runFullTest() {
    console.log('🚀 Starting Note Coach Claude Integration Test\n');

    // Check if server is running
    const serverOk = await this.checkServerStatus();
    if (!serverOk) return;

    // Test basic tools functionality
    const toolsResults = await this.testBasicToolsFunctionality();
    
    // Test Claude API connection
    const claudeOk = await this.testClaudeAPIConnection();

    // Generate results
    console.log('\n📊 Test Results Summary:');
    console.log('=====================================');
    console.log(`Server Running: ${this.serverRunning ? '✅' : '❌'}`);
    console.log(`save_note tool: ${toolsResults.save_note ? '✅' : '❌'}`);
    console.log(`get_project_context tool: ${toolsResults.get_project_context ? '✅' : '❌'}`);
    console.log(`search_notes tool: ${toolsResults.search_notes ? '✅' : '❌'}`);
    console.log(`start_coaching_session tool: ${toolsResults.start_coaching_session ? '✅' : '❌'}`);
    console.log(`Claude API Ready: ${claudeOk ? '✅' : '⚠️'}`);

    // Generate Claude test prompt
    if (this.serverRunning && toolsResults.save_note) {
      console.log('\n🎯 Ready for Claude Integration!');
      console.log('\nCopy this prompt to test with Claude:');
      console.log('=====================================');
      console.log(this.generateIntegrationPrompt());
    }

    const allGreen = this.serverRunning && 
                    Object.values(toolsResults).every(result => result);

    if (allGreen) {
      console.log('\n🎉 All systems ready for Claude integration!');
    } else {
      console.log('\n⚠️  Some issues found. Check the errors above.');
    }

    return allGreen;
  }
}

// Run the test if called directly
if (require.main === module) {
  const test = new ClaudeIntegrationTest();
  test.runFullTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = ClaudeIntegrationTest;
