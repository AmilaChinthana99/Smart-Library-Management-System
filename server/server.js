const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Seed helper
const User = require('./models/User');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Setting = require('./models/Setting');
const Transaction = require('./models/Transaction');
const Reservation = require('./models/Reservation');
const Notification = require('./models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Library Management System API',
    timestamp: new Date(),
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const autoSeed = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('🌱 Database is empty. Running automatic seed...');
    await Setting.create({
      fineRatePerDay: 1.5,
      maxLoanDays: 14,
      maxBooksPerMember: 5,
      maxUnpaidFineThreshold: 10.0,
      libraryName: 'Smart Library Management System',
    });

    const createdCategories = await Category.insertMany([
      { name: 'Computer Science & Tech', description: 'Software engineering, AI, algorithms', color: '#3B82F6' },
      { name: 'Fiction & Literature', description: 'Classic novels and modern fiction', color: '#EC4899' },
      { name: 'Business & Economics', description: 'Entrepreneurship, finance, and management', color: '#10B981' },
      { name: 'Science & Mathematics', description: 'Physics, chemistry, biology, calculus', color: '#8B5CF6' },
      { name: 'Philosophy & Psychology', description: 'Mindset, human behavior, ethics', color: '#F59E0B' },
    ]);

    const catMap = {};
    createdCategories.forEach((c) => (catMap[c.name] = c._id));

    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@library.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2831',
    });

    const librarian = await User.create({
      name: 'Sarah Connor (Head Librarian)',
      email: 'librarian@library.com',
      password: 'librarian123',
      role: 'librarian',
      phone: '+1 (555) 018-9922',
    });

    const student1 = await User.create({
      name: 'Alex Johnson (Student)',
      email: 'student1@library.com',
      password: 'student123',
      role: 'member',
      phone: '+1 (555) 017-4433',
    });

    const student2 = await User.create({
      name: 'Emily Davis (Student)',
      email: 'student2@library.com',
      password: 'student123',
      role: 'member',
      phone: '+1 (555) 016-5511',
    });

    const books = await Book.insertMany([
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        ISBN: '978-0132350884',
        category: catMap['Computer Science & Tech'],
        publisher: 'Prentice Hall',
        year: 2008,
        totalCopies: 5,
        availableCopies: 3,
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
        description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
        shelfLocation: 'CS-101',
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        ISBN: '978-1449373320',
        category: catMap['Computer Science & Tech'],
        publisher: "O'Reilly Media",
        year: 2017,
        totalCopies: 4,
        availableCopies: 2,
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        description: 'The definitive guide to the architecture of modern data systems.',
        shelfLocation: 'CS-104',
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'David Thomas, Andrew Hunt',
        ISBN: '978-0135957059',
        category: catMap['Computer Science & Tech'],
        publisher: 'Addison-Wesley',
        year: 2019,
        totalCopies: 3,
        availableCopies: 1,
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        description: 'Illustrates the best practices of software development.',
        shelfLocation: 'CS-102',
      },
      {
        title: 'You Don’t Know JS Yet: Scope & Closures',
        author: 'Kyle Simpson',
        ISBN: '978-1098104443',
        category: catMap['Computer Science & Tech'],
        publisher: "O'Reilly Media",
        year: 2020,
        totalCopies: 3,
        availableCopies: 0,
        coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
        description: 'Deep dive into JavaScript lexical scope and closures.',
        shelfLocation: 'CS-108',
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        ISBN: '978-0061120084',
        category: catMap['Fiction & Literature'],
        publisher: 'Harper Perennial',
        year: 1960,
        totalCopies: 6,
        availableCopies: 5,
        coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
        description: 'A masterpiece of modern American literature exploring racial justice.',
        shelfLocation: 'FIC-201',
      },
      {
        title: '1984',
        author: 'George Orwell',
        ISBN: '978-0451524935',
        category: catMap['Fiction & Literature'],
        publisher: 'Signet Classic',
        year: 1949,
        totalCopies: 5,
        availableCopies: 4,
        coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
        description: 'A chilling dystopian tale of total surveillance.',
        shelfLocation: 'FIC-205',
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        ISBN: '978-0735211292',
        category: catMap['Philosophy & Psychology'],
        publisher: 'Avery',
        year: 2018,
        totalCopies: 8,
        availableCopies: 6,
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
        description: 'An easy way to build good habits and break bad ones.',
        shelfLocation: 'PSY-301',
      },
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        ISBN: '978-0374533557',
        category: catMap['Philosophy & Psychology'],
        publisher: 'Farrar, Straus and Giroux',
        year: 2011,
        totalCopies: 4,
        availableCopies: 3,
        coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
        description: 'Explores the two systems that drive the way we think.',
        shelfLocation: 'PSY-305',
      },
      {
        title: 'The Intelligent Investor',
        author: 'Benjamin Graham',
        ISBN: '978-0060555665',
        category: catMap['Business & Economics'],
        publisher: 'Harper Business',
        year: 2003,
        totalCopies: 5,
        availableCopies: 4,
        coverImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
        description: 'The classic book on value investing and financial prosperity.',
        shelfLocation: 'BUS-401',
      },
      {
        title: 'Zero to One',
        author: 'Peter Thiel',
        ISBN: '978-0804139298',
        category: catMap['Business & Economics'],
        publisher: 'Crown Business',
        year: 2014,
        totalCopies: 4,
        availableCopies: 2,
        coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80',
        description: 'Notes on startups, or how to build the future.',
        shelfLocation: 'BUS-405',
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        ISBN: '978-0553380163',
        category: catMap['Science & Mathematics'],
        publisher: 'Bantam',
        year: 1998,
        totalCopies: 4,
        availableCopies: 3,
        coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80',
        description: 'A landmark volume in science writing about cosmology.',
        shelfLocation: 'SCI-501',
      },
    ]);

    // Add active & overdue loans
    const loanDueDate = new Date();
    loanDueDate.setDate(loanDueDate.getDate() + 10);
    await Transaction.create({
      bookId: books[0]._id,
      userId: student1._id,
      issueDate: new Date(),
      dueDate: loanDueDate,
      status: 'borrowed',
      issuedBy: librarian._id,
    });

    const overdueDueDate = new Date();
    overdueDueDate.setDate(overdueDueDate.getDate() - 6);
    await Transaction.create({
      bookId: books[1]._id,
      userId: student2._id,
      issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      dueDate: overdueDueDate,
      status: 'overdue',
      fineAmount: 9.0,
      finePaid: false,
      issuedBy: librarian._id,
    });

    await Reservation.create({
      bookId: books[3]._id,
      userId: student1._id,
      status: 'pending',
    });

    await Notification.create([
      {
        userId: student1._id,
        message: "Welcome to Smart Library! Your active loan for 'Clean Code' is due in 10 days.",
        type: 'general',
      },
      {
        userId: student2._id,
        message: "ALERT: Your borrowed book 'Designing Data-Intensive Applications' is 6 days overdue. Late fine: $9.00.",
        type: 'overdue',
      },
    ]);

    console.log('✅ Automatic Seed Completed Successfully!');
  }
};

const startServer = async () => {
  await connectDB();
  await autoSeed();

  app.listen(PORT, () => {
    console.log(`===========================================================`);
    console.log(`🚀 Smart Library Backend Server running on port: ${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    console.log(`===========================================================`);
  });
};

startServer();

module.exports = app;
