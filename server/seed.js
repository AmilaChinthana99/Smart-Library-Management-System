const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

const User = require('./models/User');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Transaction = require('./models/Transaction');
const Reservation = require('./models/Reservation');
const Notification = require('./models/Notification');
const Setting = require('./models/Setting');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing library database collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Book.deleteMany();
    await Transaction.deleteMany();
    await Reservation.deleteMany();
    await Notification.deleteMany();
    await Setting.deleteMany();

    console.log('🌱 Seeding initial settings...');
    await Setting.create({
      fineRatePerDay: 1.5,
      maxLoanDays: 14,
      maxBooksPerMember: 5,
      maxUnpaidFineThreshold: 10.0,
      libraryName: 'Smart Library Management System',
    });

    console.log('🌱 Seeding Categories...');
    const createdCategories = await Category.insertMany([
      { name: 'Computer Science & Tech', description: 'Software engineering, AI, algorithms, and web development', color: '#3B82F6' },
      { name: 'Fiction & Literature', description: 'Classic novels, modern fiction, and prose', color: '#EC4899' },
      { name: 'Business & Economics', description: 'Entrepreneurship, finance, management, and leadership', color: '#10B981' },
      { name: 'Science & Mathematics', description: 'Physics, chemistry, biology, calculus, and astrophysics', color: '#8B5CF6' },
      { name: 'Philosophy & Psychology', description: 'Mindset, human behavior, ethics, and ancient philosophy', color: '#F59E0B' },
    ]);

    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    console.log('🌱 Seeding Default Users (Admin, Librarian, Members)...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@library.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2831',
      address: '100 Innovation Way, Suite 400',
    });

    const librarian = await User.create({
      name: 'Sarah Connor (Head Librarian)',
      email: 'librarian@library.com',
      password: 'librarian123',
      role: 'librarian',
      phone: '+1 (555) 018-9922',
      address: '204 Bookworm Ave, Sector 4',
    });

    const member1 = await User.create({
      name: 'Alex Johnson (Student)',
      email: 'student1@library.com',
      password: 'student123',
      role: 'member',
      phone: '+1 (555) 017-4433',
      address: '742 Evergreen Terrace',
    });

    const member2 = await User.create({
      name: 'Emily Davis (Student)',
      email: 'student2@library.com',
      password: 'student123',
      role: 'member',
      phone: '+1 (555) 016-5511',
      address: '128 Baker Street',
    });

    const member3 = await User.create({
      name: 'Michael Brown (Researcher)',
      email: 'student3@library.com',
      password: 'student123',
      role: 'member',
      phone: '+1 (555) 015-8899',
      address: '42 Wallaby Way',
    });

    console.log('🌱 Seeding 15+ Comprehensive Sample Books...');
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
        description: 'The definitive guide to the architecture of modern data systems, storage engines, distributed consensus, and scalability.',
        shelfLocation: 'CS-104',
      },
      {
        title: 'The Pragmatic Programmer: Your Journey to Mastery',
        author: 'David Thomas, Andrew Hunt',
        ISBN: '978-0135957059',
        category: catMap['Computer Science & Tech'],
        publisher: 'Addison-Wesley Professional',
        year: 2019,
        totalCopies: 3,
        availableCopies: 1,
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        description: 'Illustrates the best practices and major pitfalls of software development across personal career growth.',
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
        availableCopies: 0, // Out of stock to test reservation
        coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
        description: 'Deep dive into JavaScript lexical scope, hoisting, closures, and module patterns.',
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
        description: 'A masterpiece of modern American literature exploring racial justice and human compassion in the Deep South.',
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
        description: 'A chilling dystopian tale of total surveillance, totalitarianism, and freedom of thought.',
        shelfLocation: 'FIC-205',
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        ISBN: '978-0743273565',
        category: catMap['Fiction & Literature'],
        publisher: 'Scribner',
        year: 1925,
        totalCopies: 4,
        availableCopies: 2,
        coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
        description: 'A tragic story of obsession, wealth, romance, and the illusion of the American Dream in the Roaring Twenties.',
        shelfLocation: 'FIC-210',
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
        description: 'An easy & proven way to build good habits & break bad ones using 1% incremental improvements.',
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
        description: 'Explores the two systems that drive the way we think: System 1 (fast/emotional) and System 2 (slow/logical).',
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
        description: 'The classic book on value investing, risk management, and long-term financial prosperity.',
        shelfLocation: 'BUS-401',
      },
      {
        title: 'Zero to One: Notes on Startups, or How to Build the Future',
        author: 'Peter Thiel, Blake Masters',
        ISBN: '978-0804139298',
        category: catMap['Business & Economics'],
        publisher: 'Crown Business',
        year: 2014,
        totalCopies: 4,
        availableCopies: 2,
        coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80',
        description: 'How to build companies that create new things and escape competition by achieving vertical progress.',
        shelfLocation: 'BUS-405',
      },
      {
        title: 'Principles for Dealing with the Changing World Order',
        author: 'Ray Dalio',
        ISBN: '978-1982160272',
        category: catMap['Business & Economics'],
        publisher: 'Avid Reader Press',
        year: 2021,
        totalCopies: 3,
        availableCopies: 2,
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
        description: 'Examines history’s most turbulent economic and political periods to reveal why empires rise and fall.',
        shelfLocation: 'BUS-409',
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
        description: 'A landmark volume in science writing about cosmology, black holes, time travel, and the big bang.',
        shelfLocation: 'SCI-501',
      },
      {
        title: 'The Elegant Universe: Superstrings, Hidden Dimensions',
        author: 'Brian Greene',
        ISBN: '978-0393058581',
        category: catMap['Science & Mathematics'],
        publisher: 'W. W. Norton & Company',
        year: 2003,
        totalCopies: 3,
        availableCopies: 2,
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        description: 'Unravels the mystery of string theory and quantum mechanics in pursuit of a unified theory of physics.',
        shelfLocation: 'SCI-504',
      },
      {
        title: 'Calculus: Early Transcendentals',
        author: 'James Stewart',
        ISBN: '978-1285741550',
        category: catMap['Science & Mathematics'],
        publisher: 'Cengage Learning',
        year: 2015,
        totalCopies: 6,
        availableCopies: 5,
        coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
        description: 'Essential textbook covering single-variable and multivariable calculus concepts and mathematical rigor.',
        shelfLocation: 'SCI-510',
      },
    ]);

    console.log('🌱 Seeding Initial Transactions (Active & Overdue)...');
    // Active loan for member 1
    const loan1DueDate = new Date();
    loan1DueDate.setDate(loan1DueDate.getDate() + 10);
    await Transaction.create({
      bookId: books[0]._id, // Clean Code
      userId: member1._id,
      issueDate: new Date(),
      dueDate: loan1DueDate,
      status: 'borrowed',
      issuedBy: librarian._id,
    });

    // Overdue loan with fine for member 2
    const overdueIssueDate = new Date();
    overdueIssueDate.setDate(overdueIssueDate.getDate() - 20);
    const overdueDueDate = new Date();
    overdueDueDate.setDate(overdueDueDate.getDate() - 6);

    await Transaction.create({
      bookId: books[1]._id, // Designing Data-Intensive Applications
      userId: member2._id,
      issueDate: overdueIssueDate,
      dueDate: overdueDueDate,
      status: 'overdue',
      fineAmount: 9.0, // 6 days * $1.50 = $9.00
      finePaid: false,
      issuedBy: librarian._id,
    });

    console.log('🌱 Seeding Pending Reservation for Out-of-Stock Book...');
    await Reservation.create({
      bookId: books[3]._id, // You Don't Know JS Yet (0 available copies)
      userId: member1._id,
      status: 'pending',
    });

    console.log('🌱 Seeding Welcome Notifications...');
    await Notification.create([
      {
        userId: member1._id,
        message: "Welcome to Smart Library! Your active loan for 'Clean Code' is due in 10 days.",
        type: 'general',
      },
      {
        userId: member2._id,
        message: "ALERT: Your borrowed book 'Designing Data-Intensive Applications' is 6 days overdue. Late fine: $9.00.",
        type: 'overdue',
      },
    ]);

    console.log('===============================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('===============================================================');
    console.log('🔑 DEMO ACCOUNTS CREATED:');
    console.log('   👑 ADMIN:      admin@library.com     / admin123');
    console.log('   📚 LIBRARIAN:  librarian@library.com / librarian123');
    console.log('   🎓 MEMBER 1:   student1@library.com  / student123');
    console.log('   🎓 MEMBER 2:   student2@library.com  / student123');
    console.log('===============================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
