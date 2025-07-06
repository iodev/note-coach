# Note Coach - AI-Powered Voice Note Organization & Coaching

A minimal MVP that transforms voice notes into organized, AI-enhanced project insights with Socratic coaching capabilities.

## Core Concept

Simple text input fields that users can speak into using their device's built-in voice-to-text (Google Keyboard, iOS voice input, etc.) - no custom audio processing needed!

## Features

### Phase 1 (MVP)
- **Voice-to-Text Input**: Users speak into text fields using device keyboard voice input
- **AI Categorization**: Claude automatically detects and organizes notes into projects
- **Cloud Sync**: SQLite database stored in Google Drive for cross-device access
- **Basic Search**: Find notes and projects

### Phase 2 (Coaching)
- **Socratic Mode**: AI-powered coaching sessions with follow-up questions
- **Context Awareness**: Claude pulls relevant project history for deeper insights
- **Connection Discovery**: AI identifies relationships between disparate notes

## Architecture

```
Mobile/Web Interface (text inputs + voice keyboard)
    ↓
Claude API + Custom Tools
    ↓
SQLite Database (stored in Google Drive)
```

## Custom Tools for Claude

1. **`save_note`** - Store note with timestamp and initial analysis
2. **`get_project_context`** - Retrieve all notes for a project
3. **`search_notes`** - Find relevant notes by content
4. **`analyze_connections`** - Identify relationships between notes
5. **`coaching_session`** - Generate Socratic questions for project development

## Tech Stack

- **Frontend**: Simple HTML/JS web app (mobile-responsive)
- **AI**: Claude API with custom tools
- **Storage**: SQLite3 file in Google Drive
- **Sync**: Google Drive API for cross-device access
- **Voice Input**: Device native (Google Keyboard, iOS voice input)

## Database Schema (SQLite3)

```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    project_detected TEXT,
    tags TEXT, -- JSON array
    created_device TEXT
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME
);

CREATE TABLE note_projects (
    note_id INTEGER,
    project_id INTEGER,
    confidence_score REAL,
    FOREIGN KEY (note_id) REFERENCES notes(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE connections (
    id INTEGER PRIMARY KEY,
    note_id_1 INTEGER,
    note_id_2 INTEGER,
    relationship_type TEXT,
    strength REAL,
    created_by TEXT, -- 'ai' or 'user'
    FOREIGN KEY (note_id_1) REFERENCES notes(id),
    FOREIGN KEY (note_id_2) REFERENCES notes(id)
);
```

## Getting Started

1. Set up Google Drive API credentials
2. Create initial SQLite database
3. Deploy simple web interface
4. Configure Claude API with custom tools
5. Test voice input → Claude analysis → database storage cycle

## Why This Approach?

- **Fast to Market**: Leverages existing voice-to-text capabilities
- **Cross-Platform**: Works on any device with a browser and voice input
- **Simple Sync**: Google Drive handles the complexity
- **AI-Powered**: Claude does the heavy lifting for categorization and coaching
- **Scalable**: Can add features incrementally

## Next Steps

- [ ] Set up Google Drive API integration
- [ ] Create basic HTML interface with text inputs
- [ ] Build Claude tools for database operations
- [ ] Test end-to-end workflow
- [ ] Add coaching mode interactions
