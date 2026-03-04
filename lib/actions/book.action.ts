'use server'

import {CreateBook, TextSegment} from "@/type";
import {connectToDatabase} from "@/database/mongoose";
import {generateSlug, serializeData} from "@/lib/utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/bookSegment.model";

import {revalidatePath} from "next/cache";

export const getAllBooks = async () => {
    try {
        await connectToDatabase();
        const books = await Book.find().sort({createdAt: -1}).lean();
        return {
            success: true,
            data: serializeData(books),
        }
    } catch (e) {
        console.error('Error connecting to database:', e);
        return {
            success: false, error: e
        }
    }
}

export const checkBookExists = async (title: string) => {
    try {

        await connectToDatabase()
        const slug = generateSlug(title)
        const existingBook = await Book.findOne({slug}).lean();
        if (existingBook) {
            return {
                exists: true,
                book: serializeData(existingBook)
            }
        }

        return {
            exists: false,
        }

    } catch (e) {
        console.error('Error checking book existence:', e);
        return {
            exists: false,
            error: e,
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(data.title);

        const existingBook = await Book.findOne({slug}).lean();
        if (existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
            }
        }

        // TODO: Check subscription and limit here (not implemented in this example)
        const book = await Book.create({...data, slug, totalSegments: 0});
        revalidatePath('/'); // Revalidate the homepage to show the new book
        return {
            success: true,
            data: serializeData(book),
        }
    } catch (e) {
        console.error('Error creating a book:', e);
        return {
            success: false,
            error: e,
        }
    }
}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();

        console.log('Saving book segments...');

        const segmentsToInsert = segments.map(({text, segmentIndex, pageNumber, wordCount}) => ({
            clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount
        }));
        await BookSegment.insertMany(segmentsToInsert);
        await Book.findByIdAndUpdate(bookId, {totalSegments: segments.length});

        console.log('Book segments saved successfully');
        return {
            success: true,
            data: {segmentsCreated: segments.length}
        }

    } catch (e) {
        console.error('Error saving book segments:', e);
        await BookSegment.deleteMany({bookId})
        await Book.findByIdAndDelete(bookId);
        console.log('Deleted book and segments due to error');
        return {
            success: false,
            error: e,
        }
    }
}

// New: searchBookSegments performs a MongoDB text search on the BookSegment collection for a given bookId and query.
export const searchBookSegments = async (bookId: string, query: string, topN: number = 3, userId: any) => {
    try {
        const normalizedQuery = query.trim();
                const safeTopN = Number.isInteger(topN) ? Math.min(Math.max(topN, 1), 10) : 3;

        await connectToDatabase();

        if (!bookId || !normalizedQuery) {
            return { success: false, error: 'Missing bookId or query' };
        }

        // Use MongoDB text search (requires a text index on `content` which exists in the model)
        const results = await BookSegment.find(
            { bookId, $text: { $search: normalizedQuery } },
            {content: 1, segmentIndex: 1, pageNumber: 1, wordCount: 1, score: {$meta: 'textScore'}}
        ).sort({ score: { $meta: 'textScore' } }).limit(safeTopN).lean();

        return {
            success: true,
            data: serializeData(results || []),
        };
    } catch (e) {
        console.error('Error searching book segments:', e);
        return {success: false, error: e};
    }
}

export const getBookBySlug = async ({ slug, clerkId }: { slug: string; clerkId: string }) => {
    try {
        await connectToDatabase();

        const book = await Book.findOne({ slug, clerkId }).lean();

        if (!book) {
            return {
                success: false,
                data: null,
            }
        }

        return {
            success: true,
            data: serializeData(book),
        }
    } catch (e) {
        console.error('Error fetching book by slug:', e);
        return {
            success: false,
            error: e,
            data: null,
        }
    }
}
