'use server';
import {EndSessionResult, StartSessionResult} from '@/type'
import {connectToDatabase} from "@/database/mongoose";
import VoiceSession from "@/database/models/voiceSession.model";
import {getCurrentBillingPeriodStart} from "@/lib/subscription-constants";


export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        //Limits/Billing checks would go here
        const session = await VoiceSession.create({
            clerkId, bookId, startedAt: new Date(),
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
        await connectToDatabase();

        const result = await VoiceSession.findByIdAndUpdate(sessionId, {
            endedAt: new Date(),
            durationSeconds,
        })
        if (!result) return {success: false, error: 'Failed to find session. Please try again.'}
        return {
            success: true,
        }
    } catch (e) {
        console.error('Error starting session:', e);
        return {success: false, error: 'Failed to start session. Please try again.'}
    }
}