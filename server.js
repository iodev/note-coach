const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

// Database setup
let db;
const initDatabase = () => {
  db = new sqlite3.Database('./data/notes.sqlite3', (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
      createTables();
    }
  });
};

const createTables = () => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      project_detected TEXT,
      tags TEXT,
      created_device TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS note_projects (
      note_id INTEGER,
      project_id INTEGER,
      confidence_score REAL DEFAULT 0.8,
      FOREIGN KEY (note_id) REFERENCES notes(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,
    `CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id_1 INTEGER,
      note_id_2 INTEGER,
      relationship_type TEXT,
      strength REAL DEFAULT 0.5,
      created_by TEXT DEFAULT 'ai',
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id_1) REFERENCES notes(id),
      FOREIGN KEY (note_id_2) REFERENCES notes(id)
    )`
  ];

  tables.forEach(sql => {
    db.run(sql, (err) => {
      if (err) console.error('Error creating table:', err);
    });
  });
};

// Routes

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Claude Tool: Save Note
app.post('/tools/save_note', (req, res) => {
  const { content, project_hint, tags } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  // Simple project detection (will be enhanced with Claude)
  const detected_project = project_hint || detectProject(content);
  const tags_json = JSON.stringify(tags || []);

  db.run(
    `INSERT INTO notes (content, project_detected, tags) VALUES (?, ?, ?)`,
    [content, detected_project, tags_json],
    function(err) {
      if (err) {
        console.error('Error saving note:', err);
        return res.status(500).json({ error: 'Failed to save note' });
      }

      // Ensure project exists
      db.run(
        `INSERT OR IGNORE INTO projects (name, description) VALUES (?, ?)`,
        [detected_project, `Auto-detected project for ${detected_project} related notes`],
        (err) => {
          if (err) console.error('Error creating project:', err);
        }
      );

      res.json({
        success: true,
        note_id: this.lastID,
        project_detected: detected_project,
        tags: tags || [],
        message: 'Note saved successfully'
      });
    }
  );
});

// Claude Tool: Get Project Context
app.post('/tools/get_project_context', (req, res) => {
  const { project_name, limit = 20 } = req.body;
  
  if (!project_name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  db.all(
    `SELECT n.*, p.description as project_description 
     FROM notes n 
     LEFT JOIN projects p ON n.project_detected = p.name 
     WHERE n.project_detected = ? 
     ORDER BY n.timestamp DESC 
     LIMIT ?`,
    [project_name, limit],
    (err, rows) => {
      if (err) {
        console.error('Error fetching project context:', err);
        return res.status(500).json({ error: 'Failed to fetch project context' });
      }

      res.json({
        project_name,
        note_count: rows.length,
        notes: rows.map(row => ({
          id: row.id,
          content: row.content,
          timestamp: row.timestamp,
          tags: JSON.parse(row.tags || '[]')
        })),
        project_description: rows[0]?.project_description || 'Auto-detected project'
      });
    }
  );
});

// Claude Tool: Search Notes
app.post('/tools/search_notes', (req, res) => {
  const { query, project_filter } = req.body;
  
  // Handle empty query to get all notes
  let sql = `SELECT * FROM notes`;
  let params = [];

  if (query && query.trim()) {
    sql += ` WHERE content LIKE ?`;
    params.push(`%${query}%`);
  }

  if (project_filter) {
    sql += query && query.trim() ? ` AND project_detected = ?` : ` WHERE project_detected = ?`;
    params.push(project_filter);
  }

  sql += ` ORDER BY timestamp DESC LIMIT 50`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error searching notes:', err);
      return res.status(500).json({ error: 'Failed to search notes' });
    }

    res.json({
      query: query || '',
      project_filter,
      results: rows.map(row => ({
        id: row.id,
        content: row.content,
        timestamp: row.timestamp,
        project: row.project_detected,
        tags: JSON.parse(row.tags || '[]')
      }))
    });
  });
});

// Claude Tool: Start Coaching Session
app.post('/tools/start_coaching_session', (req, res) => {
  const { project_name, focus_area, session_type = 'exploration' } = req.body;
  
  if (!project_name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  // This would typically call Claude API to generate questions
  // For now, return a structured response that Claude can use
  res.json({
    project_name,
    focus_area,
    session_type,
    coaching_prompt: `I'd like to start a ${session_type} coaching session about your "${project_name}" project${focus_area ? ` focusing on ${focus_area}` : ''}. Let me ask you some thoughtful questions to help deepen your thinking.`,
    suggested_questions: [
      "What's the most important outcome you're hoping to achieve with this project?",
      "What assumptions are you making that might be worth questioning?",
      "If you could only work on one aspect of this project, what would have the biggest impact?",
      "What would someone who disagrees with your approach say?",
      "What would this look like if it were twice as simple?"
    ],
    context_needed: true // Signal that Claude should get project context first
  });
});

// Utility function for simple project detection
function detectProject(content) {
  const keywords = {
    'fitness': ['workout', 'exercise', 'gym', 'running', 'training', 'health'],
    'work': ['meeting', 'project', 'deadline', 'client', 'team', 'business'],
    'personal': ['family', 'friend', 'home', 'weekend', 'vacation'],
    'learning': ['study', 'learn', 'course', 'book', 'research', 'education'],
    'creative': ['design', 'art', 'music', 'writing', 'creative', 'idea'],
    'finance': ['money', 'budget', 'investment', 'savings', 'expense']
  };

  const lowerContent = content.toLowerCase();
  for (const [project, words] of Object.entries(keywords)) {
    if (words.some(word => lowerContent.includes(word))) {
      return project;
    }
  }
  return 'general';
}

// Create data directory
const fs = require('fs');
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
}

// Initialize database and start server
initDatabase();

app.listen(PORT, () => {
  console.log(`Note Coach server running on http://localhost:${PORT}`);
  console.log('Claude tools available at:');
  console.log('  POST /tools/save_note');
  console.log('  POST /tools/get_project_context');
  console.log('  POST /tools/search_notes');
  console.log('  POST /tools/start_coaching_session');
});

module.exports = app;
