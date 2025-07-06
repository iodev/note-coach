const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

class GoogleDriveSetup {
  constructor() {
    this.drive = null;
    this.databaseFileName = 'note-coach-database.sqlite3';
    this.localDbPath = './data/notes.sqlite3';
    this.envPath = './.env';
  }

  async initializeGoogleDrive() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
        },
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      console.log('✅ Google Drive API initialized');
      return true;
    } catch (error) {
      console.log('❌ Google Drive initialization failed:', error.message);
      return false;
    }
  }

  async checkIfDatabaseExistsOnDrive() {
    try {
      const response = await this.drive.files.list({
        q: `name='${this.databaseFileName}' and trashed=false`,
        fields: 'files(id, name, createdTime)',
      });

      if (response.data.files.length > 0) {
        const file = response.data.files[0];
        console.log(`✅ Found existing database on Drive: ${file.id}`);
        return file.id;
      }
      return null;
    } catch (error) {
      console.log('❌ Error checking Drive for existing database:', error.message);
      return null;
    }
  }

  async uploadDatabaseToDrive() {
    try {
      // Ensure local database exists
      if (!fs.existsSync(this.localDbPath)) {
        console.log('📁 Creating initial local database...');
        // Create empty database file
        fs.writeFileSync(this.localDbPath, '');
      }

      const fileMetadata = {
        name: this.databaseFileName,
        description: 'Note Coach SQLite database for voice notes and AI coaching',
      };

      const media = {
        mimeType: 'application/x-sqlite3',
        body: fs.createReadStream(this.localDbPath),
      };

      console.log('📤 Uploading database to Google Drive...');
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });

      console.log(`✅ Database uploaded successfully! File ID: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.log('❌ Upload failed:', error.message);
      return null;
    }
  }

  async downloadDatabaseFromDrive(fileId) {
    try {
      console.log('📥 Downloading database from Google Drive...');
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      // Ensure data directory exists
      const dataDir = path.dirname(this.localDbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(this.localDbPath, response.data);
      console.log('✅ Database downloaded successfully');
      return true;
    } catch (error) {
      console.log('❌ Download failed:', error.message);
      return false;
    }
  }

  updateEnvFile(fileId) {
    try {
      let envContent = '';
      
      // Read existing .env if it exists
      if (fs.existsSync(this.envPath)) {
        envContent = fs.readFileSync(this.envPath, 'utf8');
      } else if (fs.existsSync('.env.example')) {
        // Copy from .env.example if .env doesn't exist
        envContent = fs.readFileSync('.env.example', 'utf8');
      }

      // Update or add the Google Drive file ID
      const fileIdLine = `GOOGLE_DRIVE_DATABASE_FILE_ID=${fileId}`;
      
      if (envContent.includes('GOOGLE_DRIVE_DATABASE_FILE_ID=')) {
        // Replace existing line
        envContent = envContent.replace(
          /GOOGLE_DRIVE_DATABASE_FILE_ID=.*/,
          fileIdLine
        );
      } else {
        // Add new line
        envContent += `\n${fileIdLine}\n`;
      }

      fs.writeFileSync(this.envPath, envContent);
      console.log('✅ Updated .env file with Google Drive file ID');
      return true;
    } catch (error) {
      console.log('❌ Failed to update .env file:', error.message);
      return false;
    }
  }

  async setupGoogleDriveSync() {
    console.log('🚀 Starting Google Drive Setup for Note Coach\n');

    // Check if required environment variables exist
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.log('⚠️  Google Drive credentials not found in .env file');
      console.log('   Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
      console.log('   Get credentials from: https://console.developers.google.com/\n');
      
      this.showManualSetupInstructions();
      return false;
    }

    // Initialize Google Drive API
    const driveInitialized = await this.initializeGoogleDrive();
    if (!driveInitialized) return false;

    // Check if database already exists on Drive
    const existingFileId = await this.checkIfDatabaseExistsOnDrive();
    
    let fileId;
    if (existingFileId) {
      console.log('📁 Using existing database from Google Drive');
      fileId = existingFileId;
      
      // Download existing database
      await this.downloadDatabaseFromDrive(fileId);
    } else {
      console.log('📁 No existing database found, creating new one');
      
      // Upload new database to Drive
      fileId = await this.uploadDatabaseToDrive();
      if (!fileId) return false;
    }

    // Update .env file with file ID
    const envUpdated = this.updateEnvFile(fileId);
    if (!envUpdated) return false;

    console.log('\n🎉 Google Drive setup complete!');
    console.log(`   Database File ID: ${fileId}`);
    console.log(`   Local Database: ${this.localDbPath}`);
    console.log(`   Drive Database: ${this.databaseFileName}`);
    console.log('\n🔄 Your notes will now sync across all devices!');
    
    return true;
  }

  showManualSetupInstructions() {
    console.log('📋 Manual Setup Instructions:');
    console.log('=====================================');
    console.log('1. Go to https://console.developers.google.com/');
    console.log('2. Create a new project or select existing');
    console.log('3. Enable Google Drive API');
    console.log('4. Create credentials (OAuth 2.0 Client ID)');
    console.log('5. Add to .env file:');
    console.log('   GOOGLE_CLIENT_ID=your_client_id');
    console.log('   GOOGLE_CLIENT_SECRET=your_client_secret');
    console.log('6. Run: npm run setup:drive');
    console.log('\nAlternatively:');
    console.log('• Create SQLite file manually and upload to Drive');
    console.log('• Add GOOGLE_DRIVE_DATABASE_FILE_ID=file_id to .env');
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new GoogleDriveSetup();
  setup.setupGoogleDriveSync()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = GoogleDriveSetup;
