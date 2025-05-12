// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Create uploads directory if it doesn't exist 