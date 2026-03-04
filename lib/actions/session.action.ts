'use server';
import {EndSessionResult, StartSessionResult} from '@/type'
import {connectToDatabase} from "@/database/mongoose";
import VoiceSession from "@/database/models/voiceSession.model";
import {getCurrentBillingPeriodStart} from "@/lib/subscription-constants";
import {auth} from "@clerk/nextjs/server";


export const startVoiceSession = async (bookId: string, _id: string): Promise<StartSessionResult> => {
    try {
        const {userId} = await auth();
        if (!userId) return {success: false, error: "Unauthorized"};
        await connectToDatabase();

        //Limits/Billing checks would go here
        const session = await VoiceSession.create({
            clerkId: userId, bookId, startedAt: new Date(),
            billingPeriodStart: getCurrentBillingPeriodStart()
            , durationSeconds: 0,
        })
        return {
            success: true, sessionId: session._id.toString(),
            //maxDurationMinutes:check.maxDurationMinutes
        }
    } catch (e) {
        console.error('Error starting session:', e);
        return {success: false, error: 'Failed to start session. Please try again.'}
    }
}

export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<EndSessionResult> => {
    try {
        const {userId} = await auth();
        if (!userId) return {success: false, error: "Unauthorized"};
        await connectToDatabase();
        if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
            return {success: false, error: 'Invalid session duration.'};
        }

        const result = await VoiceSession.findOneAndUpdate({_id: sessionId, clerkId: userId}, {
            endedAt: new Date(),
            durationSeconds,
        })
        if (!result) return {success: false, error: 'Failed to find session. Please try again.'}
        return {
            success: true,
        }
    } catch (e) {
        console.error('Error ending session:', e);
        return {success: false, error: 'Failed to end session. Please try again.'}
    }
}