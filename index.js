// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Create uploads directory if it doesn't exist 

// Schedule automatic backups (daily)
const scheduleBackup = () => {
  const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  // Comment out the automatic backup on startup
  // backupData().catch(err => console.error('Error creating initial backup:', err));
  console.log('Backup scheduler initialized - will create daily backups');
  
  // Schedule regular backups
  setInterval(async () => {
    try {
      await backupData();
      console.log('Automatic backup created successfully');
      
      // Clean up old backups - keep only the most recent 10
      const backupsDir = path.join(__dirname, 'data', 'backups');
      if (fs.existsSync(backupsDir)) {
        const backupFiles = fs.readdirSync(backupsDir)
          .filter(file => file.endsWith('.json'))
          .map(file => {
            const filePath = path.join(backupsDir, file);
            const stats = fs.statSync(filePath);
            return {
              name: file,
              path: filePath,
              createdAt: stats.mtime.toISOString()
            };
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Delete older backups (keep 10 most recent)
        if (backupFiles.length > 10) {
          backupFiles.slice(10).forEach(file => {
            fs.unlinkSync(file.path);
          });
        }
      }
    } catch (error) {
      console.error('Error during automatic backup:', error);
    }
  }, BACKUP_INTERVAL);
}; 