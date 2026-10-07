-- Library Management System Database Dump
-- Compatible with MySQL 5.7+ and MySQL 8.0+ / MariaDB 10.3+

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `user_tokens`;
DROP TABLE IF EXISTS `fines`;
DROP TABLE IF EXISTS `issues`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `authors`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'librarian') NOT NULL DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default Admin Account: admin@library.com / admin123
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'System Administrator', 'admin@library.com', '$2y$10$dd8UeEQpMakSLsYDh17vk.tlXvrQTNG9TPYyfjT4bjNAk0fpHOF.i', 'admin');

-- --------------------------------------------------------
-- Table: user_tokens (Session & Bearer Token Authentication)
-- --------------------------------------------------------
CREATE TABLE `user_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: categories
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Programming', 'Books on coding principles, languages, frameworks, and software construction'),
(2, 'Computer Science', 'Core theory, algorithms, data structures, and computational thinking'),
(3, 'Database Systems', 'Relational, NoSQL, data modeling, SQL queries, and distributed databases'),
(4, 'Networking', 'Computer communication protocols, OSI model, routing, security, and wireless'),
(5, 'Mathematics', 'Discrete mathematics, linear algebra, calculus, and probability for computing'),
(6, 'Science', 'General sciences, physics for engineers, and experimental methodologies'),
(7, 'Literature', 'Classic and contemporary literary fiction, non-fiction, and essays'),
(8, 'History', 'World history, civilizations, industrial revolution, and computing history');

-- --------------------------------------------------------
-- Table: authors
-- --------------------------------------------------------
CREATE TABLE `authors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `biography` TEXT DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `authors` (`id`, `name`, `biography`, `country`) VALUES
(1, 'Robert C. Martin', 'Uncle Bob Martin is an American software engineer and author known for Clean Code and Agile manifesto principles.', 'United States'),
(2, 'Martin Fowler', 'Chief Scientist at ThoughtWorks, author of books on software architecture, refactoring, and enterprise patterns.', 'United Kingdom'),
(3, 'Andrew S. Tanenbaum', 'Professor Emeritus of Computer Science at Vrije Universiteit Amsterdam, creator of MINIX and prominent author on Operating Systems.', 'Netherlands'),
(4, 'Abraham Silberschatz', 'Professor of Computer Science at Yale University, widely known for seminal textbooks on Operating Systems and Database Systems.', 'United States'),
(5, 'Donald Knuth', 'Legendary computer scientist, mathematician, and professor at Stanford University, author of The Art of Computer Programming.', 'United States'),
(6, 'Thomas H. Cormen', 'Co-author of Introduction to Algorithms (CLRS), professor emeritus of computer science at Dartmouth College.', 'United States'),
(7, 'Eric Evans', 'Domain-Driven Design pioneer and software design consultant with decades of systems architecture experience.', 'United States'),
(8, 'Brian W. Kernighan', 'Canadian computer scientist at Princeton University, co-designer of AWK and AMPL, co-author of The C Programming Language.', 'Canada'),
(9, 'Joshua Bloch', 'Software engineer and author who led the design of Java platform features including the Collections framework.', 'United States'),
(10, 'Stuart Russell', 'Professor of Computer Science at UC Berkeley, renowned researcher in artificial intelligence and co-author of AIMA.', 'United Kingdom');

-- --------------------------------------------------------
-- Table: books
-- --------------------------------------------------------
CREATE TABLE `books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `isbn` VARCHAR(20) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `author_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `publisher` VARCHAR(150) DEFAULT NULL,
  `publication_year` INT DEFAULT NULL,
  `total_copies` INT NOT NULL DEFAULT 1,
  `available_copies` INT NOT NULL DEFAULT 1,
  `shelf_number` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Available', 'Unavailable') NOT NULL DEFAULT 'Available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_books_author` FOREIGN KEY (`author_id`) REFERENCES `authors` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `books` (`id`, `isbn`, `title`, `author_id`, `category_id`, `publisher`, `publication_year`, `total_copies`, `available_copies`, `shelf_number`, `description`, `status`) VALUES
(1, '978-0132350884', 'Clean Code: A Handbook of Agile Software Craftsmanship', 1, 1, 'Prentice Hall', 2008, 5, 3, 'A-101', 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.', 'Available'),
(2, '978-0134494166', 'Clean Architecture: A Craftsman’s Guide to Software Structure', 1, 1, 'Prentice Hall', 2017, 4, 3, 'A-102', 'Practical software architecture rules and principles for Universal Software design.', 'Available'),
(3, '978-0201485677', 'Refactoring: Improving the Design of Existing Code', 2, 1, 'Addison-Wesley', 1999, 4, 3, 'A-103', 'A comprehensive guide to refactoring techniques, code smells, and patterns.', 'Available'),
(4, '978-0321127426', 'Patterns of Enterprise Application Architecture', 2, 1, 'Addison-Wesley', 2002, 3, 2, 'A-104', 'Practices, object-oriented solutions, and enterprise patterns for web architecture.', 'Available'),
(5, '978-0133591620', 'Modern Operating Systems (4th Edition)', 3, 2, 'Pearson', 2014, 6, 4, 'B-201', 'Classic text covering processes, memory management, file systems, virtualization, and modern OS internals.', 'Available'),
(6, '978-0132126953', 'Computer Networks (5th Edition)', 3, 4, 'Pearson', 2010, 5, 4, 'B-202', 'In-depth introduction to computer networks, communication protocols, layers, and internet design.', 'Available'),
(7, '978-0078022159', 'Database System Concepts (7th Edition)', 4, 3, 'McGraw-Hill', 2019, 7, 5, 'C-301', 'Foundational concepts of database management, relational algebra, SQL, indexing, and transaction processing.', 'Available'),
(8, '978-0073523323', 'Operating System Concepts (10th Edition)', 4, 2, 'Wiley', 2018, 5, 4, 'C-302', 'Comprehensive guide to OS concepts, process synchronization, CPU scheduling, and storage management.', 'Available'),
(9, '978-0201896831', 'The Art of Computer Programming, Vol. 1: Fundamental Algorithms', 5, 2, 'Addison-Wesley', 1997, 2, 2, 'D-401', 'The bible of computer algorithms, mathematical preliminaries, and information structures.', 'Available'),
(10, '978-0262033848', 'Introduction to Algorithms (CLRS 3rd Edition)', 6, 2, 'MIT Press', 2009, 8, 5, 'D-402', 'Standard university textbook on algorithm design, graph theory, dynamic programming, and complexity.', 'Available'),
(11, '978-0321125217', 'Domain-Driven Design: Tackling Complexity in Software', 7, 1, 'Addison-Wesley', 2003, 3, 2, 'E-501', 'Systematic approach to domain-driven design, ubiquitous language, and bounded contexts.', 'Available'),
(12, '978-0131103627', 'The C Programming Language (2nd Edition)', 8, 1, 'Prentice Hall', 1988, 6, 5, 'A-105', 'The definitive reference and guide to ANSI C written by the creators of the language.', 'Available'),
(13, '978-0134685991', 'Effective Java (3rd Edition)', 9, 1, 'Addison-Wesley', 2017, 5, 4, 'A-106', 'Essential best practices for the Java programming language from an architect of Java libraries.', 'Available'),
(14, '978-0135166307', 'Core Java Volume I - Fundamentals (11th Edition)', 9, 1, 'Prentice Hall', 2018, 4, 3, 'A-107', 'Meticulous, authoritative guide to core Java programming, generics, and concurrent programming.', 'Available'),
(15, '978-0136042594', 'Artificial Intelligence: A Modern Approach (4th Edition)', 10, 2, 'Pearson', 2020, 6, 4, 'F-601', 'Leading textbook in artificial intelligence, search algorithms, knowledge representation, and probabilistic reasoning.', 'Available'),
(16, '978-0134444321', 'Discrete Mathematics and Its Applications (8th Edition)', 6, 5, 'McGraw-Hill', 2018, 5, 4, 'G-701', 'Foundations of mathematical reasoning, combinatorics, discrete probability, and graph theory.', 'Available'),
(17, '978-0471249764', 'Advanced Engineering Mathematics (10th Edition)', 6, 5, 'Wiley', 2011, 4, 4, 'G-702', 'Comprehensive reference for applied mathematics, differential equations, and complex analysis.', 'Available'),
(18, '978-0321714114', 'Physics for Scientists and Engineers (4th Edition)', 10, 6, 'Pearson', 2013, 3, 3, 'H-801', 'Fundamental physics principles, mechanics, electromagnetism, and optics for engineering students.', 'Available'),
(19, '978-0140449136', 'The Odyssey (Homer - Fagles Translation)', 8, 7, 'Penguin Classics', 1996, 3, 3, 'L-901', 'Epic poem of Odysseus’ ten-year journey home after the fall of Troy.', 'Available'),
(20, '978-0679720201', 'A History of the Modern World', 5, 8, 'Knopf', 2001, 2, 2, 'H-951', 'In-depth historical narrative of the rise of modern civilization and scientific revolutions.', 'Available'),
(21, '978-0596517748', 'JavaScript: The Good Parts', 1, 1, 'O’Reilly Media', 2008, 4, 3, 'A-108', 'Unearths the good ideas in JavaScript: functions, loose typing, dynamic objects, and expressive JSON.', 'Available');

-- --------------------------------------------------------
-- Table: members
-- --------------------------------------------------------
CREATE TABLE `members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_code` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `course` VARCHAR(100) DEFAULT NULL,
  `year` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `join_date` DATE NOT NULL,
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `members` (`id`, `member_code`, `full_name`, `email`, `phone`, `department`, `course`, `year`, `address`, `join_date`, `status`) VALUES
(1, 'STU001', 'Aarav Sharma', 'aarav.sharma@college.edu', '9876543201', 'Computer Science', 'B.Tech CSE', '3rd Year', 'Hostel Block A, Room 102', '2024-08-01', 'Active'),
(2, 'STU002', 'Priya Patel', 'priya.patel@college.edu', '9876543202', 'Computer Science', 'B.Tech CSE', '3rd Year', 'Flat 402, Sunshine Apts, College Road', '2024-08-01', 'Active'),
(3, 'STU003', 'Rohan Verma', 'rohan.verma@college.edu', '9876543203', 'Information Technology', 'B.Tech IT', '2nd Year', 'Hostel Block B, Room 215', '2025-08-05', 'Active'),
(4, 'STU004', 'Sneha Iyer', 'sneha.iyer@college.edu', '9876543204', 'Electronics & Comm.', 'B.Tech ECE', '4th Year', '12 Lake View Road, Campus North', '2023-08-10', 'Active'),
(5, 'STU005', 'Aditya Singh', 'aditya.singh@college.edu', '9876543205', 'Mechanical Engg.', 'B.Tech ME', '2nd Year', 'Hostel Block C, Room 304', '2025-08-05', 'Active'),
(6, 'STU006', 'Ananya Deshmukh', 'ananya.d@college.edu', '9876543206', 'Computer Applications', 'MCA', '1st Year', 'Rose Villa, Near Main Gate', '2025-09-01', 'Active'),
(7, 'STU007', 'Kavita Menon', 'kavita.menon@college.edu', '9876543207', 'Computer Applications', 'BCA', '3rd Year', 'Hostel Block A, Room 311', '2024-08-01', 'Active'),
(8, 'STU008', 'Vikram Malhotra', 'vikram.m@college.edu', '9876543208', 'Civil Engg.', 'B.Tech CE', '1st Year', 'Green Meadows, Sector 4', '2026-08-12', 'Active'),
(9, 'STU009', 'Neha Gupta', 'neha.gupta@college.edu', '9876543209', 'Information Technology', 'B.Tech IT', '3rd Year', 'Hostel Block B, Room 108', '2024-08-01', 'Active'),
(10, 'STU010', 'Arjun Joshi', 'arjun.joshi@college.edu', '9876543210', 'Computer Science', 'B.Tech CSE', '4th Year', '84 University Enclave', '2023-08-10', 'Inactive');

-- --------------------------------------------------------
-- Table: issues
-- --------------------------------------------------------
CREATE TABLE `issues` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `book_id` INT NOT NULL,
  `member_id` INT NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `return_date` DATE DEFAULT NULL,
  `status` ENUM('Issued', 'Returned', 'Overdue') NOT NULL DEFAULT 'Issued',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_issues_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_issues_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `issues` (`id`, `book_id`, `member_id`, `issue_date`, `due_date`, `return_date`, `status`, `notes`) VALUES
-- Returned issue on time (no fine)
(1, 1, 1, '2026-09-01', '2026-09-15', '2026-09-14', 'Returned', 'Returned in good condition'),
-- Returned issue with 3 days overdue (fine paid)
(2, 3, 2, '2026-09-05', '2026-09-19', '2026-09-22', 'Returned', '3 days overdue, fine settled'),
-- Active issue (normal, not yet due)
(3, 1, 3, '2026-10-01', '2026-10-15', NULL, 'Issued', 'Midterm preparation'),
-- Active issue (normal, not yet due)
(4, 5, 4, '2026-09-28', '2026-10-12', NULL, 'Issued', 'OS lab assignment'),
-- Active issue (OVERDUE! due date 2026-09-25, current date is October)
(5, 7, 5, '2026-09-10', '2026-09-24', NULL, 'Overdue', 'Reminder email sent to student'),
-- Active issue (normal)
(6, 10, 6, '2026-10-02', '2026-10-16', NULL, 'Issued', 'Competitive programming course'),
-- Active issue (OVERDUE!)
(7, 10, 7, '2026-09-08', '2026-09-22', NULL, 'Overdue', 'Library notice issued'),
-- Active issue (normal)
(8, 2, 8, '2026-10-03', '2026-10-17', NULL, 'Issued', 'Software engineering project');

-- --------------------------------------------------------
-- Table: fines
-- --------------------------------------------------------
CREATE TABLE `fines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `issue_id` INT NOT NULL UNIQUE,
  `member_id` INT NOT NULL,
  `overdue_days` INT NOT NULL DEFAULT 0,
  `fine_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('Pending', 'Paid') NOT NULL DEFAULT 'Pending',
  `paid_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_fines_issue` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_fines_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `fines` (`id`, `issue_id`, `member_id`, `overdue_days`, `fine_amount`, `payment_status`, `paid_date`) VALUES
-- Paid fine for issue #2 (3 days * 5 = ₹15)
(1, 2, 2, 3, 15.00, 'Paid', '2026-09-22'),
-- Pending fine for overdue issue #5 (due 2026-09-24, 11 days * 5 = ₹55)
(2, 5, 5, 11, 55.00, 'Pending', NULL),
-- Pending fine for overdue issue #7 (due 2026-09-22, 13 days * 5 = ₹65)
(3, 7, 7, 13, 65.00, 'Pending', NULL);

-- --------------------------------------------------------
-- Table: settings
-- --------------------------------------------------------
CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(50) NOT NULL UNIQUE,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `description`) VALUES
(1, 'library_name', 'College Central Library', 'Display name of the college library system'),
(2, 'fine_per_day', '5.00', 'Fine amount in rupees charged per day overdue'),
(3, 'max_issue_days', '14', 'Default loan period in days for borrowed books'),
(4, 'max_books_per_member', '3', 'Maximum number of simultaneously active books a member can issue'),
(5, 'contact_email', 'library@college.edu', 'Official contact email for notifications and student queries'),
(6, 'contact_phone', '+91 98765 43210', 'Librarian desk contact phone number'),
(7, 'currency_symbol', '₹', 'Currency symbol used for fines and transactions');
