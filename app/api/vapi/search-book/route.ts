import {NextResponse} from 'next/server';
import {searchBookSegments} from '@/lib/actions/book.action';
import {auth} from "@clerk/nextjs/server";

// POST /api/vapi/search-book
export async function POST(request: Request) {
    try {
        const {userId} = await auth();
        if (!userId) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }
        const body = await request.json();

        // Expecting Vapi tool call payload which may contain an array of calls or a single call.
        // We'll support both shapes for robustness.

        const calls = Array.isArray(body?.calls) ? body.calls : (body ? [body] : []);

        // Find the first call with name matching "search book" (case-insensitive)
        const searchCall = calls.find((c: any) => {
            const name = (c?.name || c?.tool || c?.toolName || '').toString().toLowerCase();
            return name === 'search book' || name === 'search-book' || name === 'search_book';
        });

        if (!searchCall) {
            return NextResponse.json({error: 'No search book call found'}, {status: 400});
        }

        // Parameters may live in different fields depending on Vapi shape; check common locations
        const params = searchCall.params || searchCall.parameters || searchCall.args || searchCall.arguments || searchCall;

        const bookId = params?.bookId || params?.book_id || params?.book || params?.bookID || params?.bookID;
        const query = params?.query || params?.q || params?.text || params?.prompt;

        if (!bookId || !query) {
            return NextResponse.json({error: 'Missing bookId or query in search parameters'}, {status: 400});
        }

        const topN = params?.topN ? Number(params.topN) : 3;

        const result = await searchBookSegments(bookId.toString(), query.toString(), topN, userId);

        if (!result.success) {
            return NextResponse.json({error: 'Search failed', details: result.error}, {status: 500});
        }

        const segments = result.data as Array<any>;

        if (!segments || segments.length === 0) {
            return NextResponse.json({result: 'no information found about this topic'});
        }

        // Combine segment contents separated by double new lines
        const combined = segments.map(s => s.content || s).join('\n\n');

        return NextResponse.json({result: combined});
    } catch (e: any) {
        console.error('Vapi search-book route error:', e);
        return NextResponse.json({error: e?.message || 'Internal server error'}, {status: 500});
    }
}
