import {StartSessionResult} from "@/type";
import {connectToDatabase} from "@/database/mongoose";

export const getCurrentBillingPeriodStart = (): Date => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)); // First day of the current month
}
