import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lawfirm';

// Enhanced CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB connection with better error handling
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${MONGODB_URI}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Schemas
const firmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  website: String,
  address: String,
  specializations: [String],
  subscriptionPlan: { type: String, default: 'basic' },
  maxUsers: { type: Number, default: 5 },
  currentUsers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'associate' },
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  department: String,
  phone: String,
  specializations: [String],
  status: { type: String, default: 'active' },
  joinDate: { type: Date, default: Date.now },
  permissions: [{
    name: String,
    description: String,
    category: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  caseType: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['active', 'pending', 'closed', 'on_hold'] },
  priority: { type: String, default: 'medium', enum: ['high', 'medium', 'low'] },
  summary: String,
  dueDate: Date,
  billableHours: { type: Number, default: 0 },
  assignedTo: [String],
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const calendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  eventType: { 
    type: String, 
    default: 'meeting',
    enum: ['meeting', 'court_hearing', 'deadline', 'consultation', 'other']
  },
  location: String,
  priority: { type: String, default: 'medium', enum: ['high', 'medium', 'low'] },
  status: { type: String, default: 'scheduled', enum: ['scheduled', 'completed', 'cancelled'] },
  attendees: [String],
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Firm = mongoose.model('Firm', firmSchema);
const User = mongoose.model('User', userSchema);
const Case = mongoose.model('Case', caseSchema);
const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

// Helper functions
const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  req.userId = decoded.userId;
  next();
};

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Auth Routes
app.post('/api/auth/signin', async (req, res) => {
  try {
    console.log('Sign in attempt for:', req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email }).populate('firmId');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());
    
    const authUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      firmId: user.firmId._id.toString(),
      firm: {
        id: user.firmId._id.toString(),
        name: user.firmId.name,
        email: user.firmId.email,
      },
      department: user.department,
      phone: user.phone,
      specializations: user.specializations || [],
      permissions: user.permissions || [],
    };

    console.log('Sign in successful for:', email);
    res.json({ success: true, user: authUser, token });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'An error occurred during sign in' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('Sign up attempt for firm:', req.body.firmName);
    const firmData = req.body;
    
    if (!firmData.adminEmail || !firmData.password || !firmData.firmName) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: firmData.adminEmail });
    if (existingUser) {
      console.log('User already exists:', firmData.adminEmail);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if firm already exists
    const existingFirm = await Firm.findOne({ email: firmData.email });
    if (existingFirm) {
      console.log('Firm already exists:', firmData.email);
      return res.status(400).json({ error: 'Firm already exists with this email' });
    }

    // Create firm
    const firm = new Firm({
      name: firmData.firmName,
      email: firmData.email,
      phone: firmData.phone,
      website: firmData.website,
      address: firmData.address,
      specializations: firmData.specializations || [],
      currentUsers: 1,
    });

    await firm.save();
    console.log('Firm created:', firm.name);

    // Hash password
    const hashedPassword = await hashPassword(firmData.password);

    // Create admin user with all permissions
    const adminPermissions = [
      { name: 'view_cases', description: 'Can view all cases', category: 'cases' },
      { name: 'edit_cases', description: 'Can create and edit cases', category: 'cases' },
      { name: 'delete_cases', description: 'Can delete cases', category: 'cases' },
      { name: 'manage_team', description: 'Can add/remove team members', category: 'team' },
      { name: 'view_documents', description: 'Can view documents', category: 'documents' },
      { name: 'upload_documents', description: 'Can upload documents', category: 'documents' },
      { name: 'manage_calendar', description: 'Can create/edit calendar events', category: 'calendar' },
      { name: 'system_settings', description: 'Can modify system settings', category: 'settings' },
    ];

    const user = new User({
      name: firmData.adminName,
      email: firmData.adminEmail,
      password: hashedPassword,
      role: 'partner',
      firmId: firm._id,
      department: 'Administration',
      phone: firmData.adminPhone,
      permissions: adminPermissions,
    });

    await user.save();
    console.log('Admin user created:', user.email);

    const token = generateToken(user._id.toString());
    
    const authUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      firmId: firm._id.toString(),
      firm: {
        id: firm._id.toString(),
        name: firm.name,
        email: firm.email,
      },
      department: user.department,
      phone: user.phone,
      specializations: user.specializations || [],
      permissions: user.permissions || [],
    };

    console.log('Sign up successful for:', firmData.adminEmail);
    res.json({ success: true, user: authUser, token });
  } catch (error) {
    console.error('Sign up error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('firmId');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const authUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      firmId: user.firmId._id.toString(),
      firm: {
        id: user.firmId._id.toString(),
        name: user.firmId.name,
        email: user.firmId.email,
      },
      department: user.department,
      phone: user.phone,
      specializations: user.specializations || [],
      permissions: user.permissions || [],
    };

    res.json({ user: authUser });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
});

// Cases Routes
app.get('/api/cases', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cases = await Case.find({ firmId: user.firmId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ cases });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ error: 'An error occurred while fetching cases' });
  }
});

app.post('/api/cases', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const caseData = {
      ...req.body,
      firmId: user.firmId,
      createdBy: user._id
    };

    const newCase = new Case(caseData);
    await newCase.save();

    const populatedCase = await Case.findById(newCase._id)
      .populate('createdBy', 'name email');

    console.log('Case created:', newCase.title);
    res.json({ success: true, case: populatedCase });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ error: 'An error occurred while creating the case' });
  }
});

app.put('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedCase = await Case.findOneAndUpdate(
      { _id: req.params.id, firmId: user.firmId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ success: true, case: updatedCase });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({ error: 'An error occurred while updating the case' });
  }
});

app.delete('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deletedCase = await Case.findOneAndDelete({
      _id: req.params.id,
      firmId: user.firmId
    });

    if (!deletedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ success: true, message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({ error: 'An error occurred while deleting the case' });
  }
});

// Team Routes
app.get('/api/team', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const teamMembers = await User.find({ firmId: user.firmId })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ teamMembers });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'An error occurred while fetching team members' });
  }
});

app.post('/api/team', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(tempPassword);

    const newMember = new User({
      ...req.body,
      password: hashedPassword,
      firmId: user.firmId,
      specializations: req.body.specialization || []
    });

    await newMember.save();

    // Update firm's current user count
    await Firm.findByIdAndUpdate(user.firmId, {
      $inc: { currentUsers: 1 }
    });

    const memberResponse = await User.findById(newMember._id).select('-password');

    console.log('Team member created:', newMember.email);
    res.json({ 
      success: true, 
      member: memberResponse,
      tempPassword // In production, send this via email instead
    });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ error: 'An error occurred while adding the team member' });
  }
});

app.put('/api/team/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedMember = await User.findOneAndUpdate(
      { _id: req.params.id, firmId: user.firmId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!updatedMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ error: 'An error occurred while updating the team member' });
  }
});

app.delete('/api/team/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (req.params.id === user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const deletedMember = await User.findOneAndDelete({
      _id: req.params.id,
      firmId: user.firmId
    });

    if (!deletedMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Update firm's current user count
    await Firm.findByIdAndUpdate(user.firmId, {
      $inc: { currentUsers: -1 }
    });

    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ error: 'An error occurred while deleting the team member' });
  }
});

// Calendar Routes
app.get('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const events = await CalendarEvent.find({ firmId: user.firmId })
      .populate('createdBy', 'name email')
      .populate('caseId', 'title clientName')
      .sort({ startDate: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'An error occurred while fetching calendar events' });
  }
});

app.post('/api/calendar', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const eventData = {
      ...req.body,
      firmId: user.firmId,
      createdBy: user._id,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate || req.body.startDate)
    };

    const newEvent = new CalendarEvent(eventData);
    await newEvent.save();

    const populatedEvent = await CalendarEvent.findById(newEvent._id)
      .populate('createdBy', 'name email')
      .populate('caseId', 'title clientName');

    console.log('Calendar event created:', newEvent.title);
    res.json({ success: true, event: populatedEvent });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ error: 'An error occurred while creating the calendar event' });
  }
});

app.put('/api/calendar/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    if (req.body.startDate) {
      updateData.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
      updateData.endDate = new Date(req.body.endDate);
    }

    const updatedEvent = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, firmId: user.firmId },
      updateData,
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('caseId', 'title clientName');

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ error: 'An error occurred while updating the calendar event' });
  }
});

app.delete('/api/calendar/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deletedEvent = await CalendarEvent.findOneAndDelete({
      _id: req.params.id,
      firmId: user.firmId
    });

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    res.json({ success: true, message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ error: 'An error occurred while deleting the calendar event' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});