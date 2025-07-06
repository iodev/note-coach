# Getting Started with Note Coach

## Quick Setup

1. **Install Dependencies**
   ```bash
   cd ~/dev/note-coach
   npm install
   ```

2. **Set up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (optional for basic testing)
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - Start taking voice notes using your device's keyboard voice input

## Testing the Basic Workflow

1. **Take a Voice Note**
   - Tap in the text area
   - Use your keyboard's microphone button (🎤) to speak
   - Example: "I need to plan my workout routine for next week"

2. **Save and See AI Analysis**
   - Click "Save & Analyze Note"
   - Note will be automatically categorized (e.g., "fitness")

3. **Try Coaching Mode**
   - Click "Coach Me" next to any note
   - This will eventually integrate with Claude for Socratic questioning

## Next Steps

### Phase 1: Basic Claude Integration
- [ ] Set up Claude API key in .env
- [ ] Test Claude tools endpoints with curl/Postman
- [ ] Integrate frontend with Claude tools

### Phase 2: Google Drive Sync
- [ ] Set up Google Drive API credentials
- [ ] Implement database sync to/from Google Drive
- [ ] Test cross-device synchronization

### Phase 3: Enhanced Coaching
- [ ] Implement full Socratic questioning with Claude
- [ ] Add coaching session history
- [ ] Improve connection discovery between notes

## Testing Tools Endpoints

You can test the Claude tools directly:

```bash
# Save a note
curl -X POST http://localhost:3000/tools/save_note \
  -H "Content-Type: application/json" \
  -d '{"content": "I want to start running three times a week"}'

# Get project context
curl -X POST http://localhost:3000/tools/get_project_context \
  -H "Content-Type: application/json" \
  -d '{"project_name": "fitness"}'

# Search notes
curl -X POST http://localhost:3000/tools/search_notes \
  -H "Content-Type: application/json" \
  -d '{"query": "running"}'
```

## File Structure

```
note-coach/
├── src/
│   └── index.html          # Main web interface
├── claude-tools/
│   ├── README.md           # Tools documentation
│   └── tools-config.json   # Claude tools configuration
├── data/
│   └── notes.sqlite3       # Local database (auto-created)
├── server.js               # Express server with tools endpoints
├── package.json
├── .env.example
└── README.md
```

## MVP Features Working

✅ **Voice Input**: Uses device keyboard voice-to-text  
✅ **Local Storage**: SQLite database with proper schema  
✅ **Basic AI Categorization**: Simple keyword-based project detection  
✅ **Tools Framework**: Ready for Claude integration  
✅ **Web Interface**: Mobile-friendly interface  

## Ready for Claude Integration

The project is structured so that Claude can immediately start using the tools:
- `POST /tools/save_note` - Claude can save and analyze notes
- `POST /tools/get_project_context` - Claude can retrieve project history
- `POST /tools/search_notes` - Claude can find relevant notes
- `POST /tools/start_coaching_session` - Claude can begin Socratic questioning

The next step is connecting Claude to these endpoints to replace the simple demo functionality with real AI analysis and coaching.
