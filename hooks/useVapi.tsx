import {IBook, Messages} from "@/type";
import {useAuth} from "@clerk/nextjs";
import {useEffect, useRef, useState} from "react";
import {ASSISTANT_ID, DEFAULT_VOICE} from "@/lib/constants";
import {startVoiceSession} from "@/lib/actions/session.action";
import Vapi from "@vapi-ai/web";

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'listening' | 'thinking' | 'speaking';

export function useLatestRef<T>(value: T) {
    const ref = useRef(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref
}
const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY || '';

let vapi: InstanceType<typeof Vapi>

function getVapi() {
    if (!vapi) {
        if (!VAPI_API_KEY) {
            throw new Error("Missing VAPI_API_KEY");
        }
        vapi = new Vapi(VAPI_API_KEY);
    }
    return vapi;
}

export const useVapi = (book: IBook) => {
    const {userId} = useAuth();
    // TODO: IMPLEMENT LIMITS

    const [status, setStatus] = useState<CallStatus>('idle');
    const [messages, setMessages] = useState<Messages[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [currentUserMessage, setCurrentUserMessage] = useState('');
    // streaming assistant segments (partial messages)
    const [currentMessages, setCurrentMessages] = useState<Messages[]>([]);
    const [, setLimitError] = useState<string | null>(null);

    const sessionIdRef = useRef<string | null>(null);
    const isStoppingRef = useRef<boolean>(false);

    const vapiListenerRef = useRef<((msg: any) => void) | null>(null);

    const isActive = status === 'listening' || status === 'thinking' || status === 'speaking' || 'starting';

    const start = async () => {
        if (!userId) return setLimitError('Please sign in to use the voice assistant');
        setLimitError(null);
        setStatus('connecting')
        try {
            const result = await startVoiceSession(userId, book._id);

            if (!result.success) {
                setLimitError(result.error || 'Failed to start session. Please try again or Upgrade your plan if you have reached your limit.');
                setStatus('idle');
                return;
            }

            sessionIdRef.current = result.sessionId || null;

            const firstMessage = `Hey, good to meet you! I'm your voice assistant for ${book.title}. How can I help you today?`;
            await getVapi().start(ASSISTANT_ID, {
                firstMessage,
                variableValues: {
                    title: book.title,
                    author: book.author,
                    bookId: book._id,
                },
            })

            // Attach message listener for transcripts and streaming updates
            const handleVapiMessage = (message: any) => {
                try {
                    // Only handle TypeScript (transcript) events
                    if (!message) return;
                    // Some SDKs put event data on `.type` or `.event` — guard for both
                    const eventType = message.type || message.eventType || message.event;
                    if (eventType !== 'TypeScript') return;

                    // Normalize name + payload
                    const name = message.name || message.eventName || (message.data && message.data.name);
                    const payload = message.payload || message.data || message.body || {};

                    // Extract textual transcript from common fields
                    const text = (payload && (payload.text || payload.transcript || payload.content)) ||
                        // sometimes the SDK will include frames array
                        (Array.isArray(payload?.frames) ? payload.frames.join('') : '') || '';

                    if (!name) return;

                    switch (name) {
                        case 'user.partial': {
                            if (text && text.trim()) {
                                setCurrentUserMessage(text);
                            }
                            break;
                        }
                        case 'user.final': {
                            if (text && text.trim()) {
                                // append final user message, clear streaming user
                                setCurrentUserMessage('');
                                setStatus('thinking');
                                setMessages(prev => {
                                    const last = prev[prev.length - 1];
                                    if (last && last.role === 'user' && last.content === text) return prev;
                                    return [...prev, { role: 'user', content: text }];
                                });
                            }
                            break;
                        }
                        case 'assistant.partial': {
                            if (text && text.trim()) {
                                // Add a streaming assistant segment
                                setCurrentMessages(prev => {
                                    // Prevent unbounded growth; keep last 50 segments
                                    const next = [...prev, { role: 'assistant', content: text }];
                                    return next.length > 50 ? next.slice(next.length - 50) : next;
                                });
                                // also update legacy preview
                                setCurrentMessage(text);
                            }
                            break;
                        }
                        case 'assistant.final': {
                            if (text && text.trim()) {
                                // clear streaming assistant state
                                setCurrentMessages([]);
                                setCurrentMessage('');
                                setStatus('speaking');

                                // Deduplicate: only append if the last assistant message differs
                                setMessages(prev => {
                                    const last = prev[prev.length - 1];
                                    if (last && last.role === 'assistant' && last.content === text) return prev;
                                    return [...prev, { role: 'assistant', content: text }];
                                });
                            }
                            break;
                        }
                        default:
                            // ignore other TypeScript event names
                            break;
                    }
                } catch (e) {
                    console.error('Error handling VAPI message', e);
                }
            };

            vapiListenerRef.current = handleVapiMessage;
            // register listener (support both `.on` and `.addListener` naming)
            try {
                const v = getVapi();
                if (typeof v.on === 'function') v.on('message', handleVapiMessage);
                else if (typeof (v as any).addListener === 'function') (v as any).addListener('message', handleVapiMessage);
            } catch (e) {
                console.warn('Failed to attach VAPI message listener', e);
            }

        } catch (e) {
            console.error('Error starting VAPI session:', e);
            setStatus('idle');
            setLimitError('Failed to start voice assistant. Please try again.');
        }
    }
    const stop = async () => {
        isStoppingRef.current = true;
        // detach listener before stopping
        try {
            const v = getVapi();
            const handler = vapiListenerRef.current;
            if (handler) {
                if (typeof v.off === 'function') v.off('message', handler);
                else if (typeof (v as any).removeListener === 'function') (v as any).removeListener('message', handler);
                else if (typeof (v as any).removeEventListener === 'function') (v as any).removeEventListener('message', handler);
            }
        } catch (e) {
            // ignore
        }
        await getVapi().stop();
    }

    // cleanup on unmount: remove vapi listener if present
    useEffect(() => {
        return () => {
            try {
                const v = vapi;
                const handler = vapiListenerRef.current;
                if (v && handler) {
                    if (typeof v.off === 'function') v.off('message', handler);
                    else if (typeof (v as any).removeListener === 'function') (v as any).removeListener('message', handler);
                    else if (typeof (v as any).removeEventListener === 'function') (v as any).removeEventListener('message', handler);
                }
            } catch (e) {
                // ignore
            }
        };
    }, []);

    const clearErrors = async () => {
    }

    return {
        status, isActive, messages, currentMessage, currentUserMessage, currentMessages, start, stop, clearErrors,
        //maxDurationSeconds, remainingSeconds, showTimeWarning
    }
}
