import { config } from 'dotenv';
config();

import { PrismaClient } from './src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('Starting database seeding...');

	// Create categories
	const categories = await Promise.all([
		prisma.category.upsert({
			where: { name: 'Fiction' },
			update: {},
			create: {
				name: 'Fiction',
				description:
					'Fictional literature including novels, short stories, and creative writing',
			},
		}),
		prisma.category.upsert({
			where: { name: 'Science' },
			update: {},
			create: {
				name: 'Science',
				description:
					'Scientific textbooks, research papers, and educational materials',
			},
		}),
		prisma.category.upsert({
			where: { name: 'Technology' },
			update: {},
			create: {
				name: 'Technology',
				description:
					'Technology-related books including programming, engineering, and IT',
			},
		}),
		prisma.category.upsert({
			where: { name: 'History' },
			update: {},
			create: {
				name: 'History',
				description:
					'Historical books, biographies, and cultural studies',
			},
		}),
		prisma.category.upsert({
			where: { name: 'Mathematics' },
			update: {},
			create: {
				name: 'Mathematics',
				description:
					'Mathematical textbooks, research, and educational resources',
			},
		}),
	]);

	console.log(`Created ${categories.length} categories`);

	// Create books
	const books = await Promise.all([
		prisma.book.upsert({
			where: { isbn: '978-0-307-47431-9' },
			update: {},
			create: {
				title: 'The Great Gatsby',
				author: 'F. Scott Fitzgerald',
				isbn: '978-0-307-47431-9',
				categoryId: categories[0].id, // Fiction
				description: 'A classic American novel set in the Jazz Age',
				price: 15.99,
				totalCopies: 5,
				availableCopies: 5,
				coverImageUrl: 'https://example.com/great-gatsby.jpg',
			},
		}),
		prisma.book.upsert({
			where: { isbn: '978-0-134-68573-5' },
			update: {},
			create: {
				title: 'Introduction to Algorithms',
				author: 'Thomas H. Cormen',
				isbn: '978-0-134-68573-5',
				categoryId: categories[2].id, // Technology
				description:
					'Comprehensive guide to algorithms and data structures',
				price: 89.99,
				totalCopies: 3,
				availableCopies: 3,
				coverImageUrl: 'https://example.com/algorithms.jpg',
			},
		}),
		prisma.book.upsert({
			where: { isbn: '978-0-321-57351-3' },
			update: {},
			create: {
				title: 'Clean Code',
				author: 'Robert C. Martin',
				isbn: '978-0-321-57351-3',
				categoryId: categories[2].id, // Technology
				description: 'A handbook of agile software craftsmanship',
				price: 45.99,
				totalCopies: 4,
				availableCopies: 4,
				coverImageUrl: 'https://example.com/clean-code.jpg',
			},
		}),
		prisma.book.upsert({
			where: { isbn: '978-0-486-41147-7' },
			update: {},
			create: {
				title: 'Calculus Made Easy',
				author: 'Silvanus P. Thompson',
				isbn: '978-0-486-41147-7',
				categoryId: categories[4].id, // Mathematics
				description: 'An accessible introduction to calculus',
				price: 12.99,
				totalCopies: 6,
				availableCopies: 6,
				coverImageUrl: 'https://example.com/calculus.jpg',
			},
		}),
		prisma.book.upsert({
			where: { isbn: '978-0-307-26543-9' },
			update: {},
			create: {
				title: 'A Brief History of Time',
				author: 'Stephen Hawking',
				isbn: '978-0-307-26543-9',
				categoryId: categories[1].id, // Science
				description: 'From the Big Bang to Black Holes',
				price: 18.99,
				totalCopies: 4,
				availableCopies: 4,
				coverImageUrl: 'https://example.com/brief-history.jpg',
			},
		}),
		prisma.book.upsert({
			where: { isbn: '978-0-7432-7356-5' },
			update: {},
			create: {
				title: 'The Guns of August',
				author: 'Barbara Tuchman',
				isbn: '978-0-7432-7356-5',
				categoryId: categories[3].id, // History
				description: 'The outbreak of World War I',
				price: 16.99,
				totalCopies: 3,
				availableCopies: 3,
				coverImageUrl: 'https://example.com/guns-august.jpg',
			},
		}),
	]);

	console.log(`Created ${books.length} books`);

	// Create an admin user for testing
	const bcrypt = require('bcrypt');
	const adminPassword = await bcrypt.hash('admin123', 10);

	const admin = await prisma.user.upsert({
		where: { email: 'admin@library.com' },
		update: {},
		create: {
			email: 'admin@library.com',
			passwordHash: adminPassword,
			role: 'ADMIN',
			fullName: 'Library Administrator',
			isVerified: true,
			universityId: 'ADMIN001',
		},
	});

	console.log('Created admin user:', admin.email);

	// Create a student user for testing
	const studentPassword = await bcrypt.hash('student123', 10);

	const student = await prisma.user.upsert({
		where: { email: 'student@library.com' },
		update: {},
		create: {
			email: 'student@library.com',
			passwordHash: studentPassword,
			role: 'STUDENT',
			fullName: 'Test Student',
			isVerified: true,
			universityId: 'STU001',
		},
	});

	console.log('Created student user:', student.email);

	console.log('Database seeding completed successfully!');
	console.log('\nTest credentials:');
	console.log('Admin: admin@library.com / admin123');
	console.log('Student: student@library.com / student123');
}

main()
	.catch((e) => {
		console.error('Error during seeding:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
