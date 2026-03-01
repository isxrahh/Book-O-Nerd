'use client'

import React, {useState, useRef} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import {Upload, FileIcon, ImageIcon, X, CheckCircle2, Circle} from 'lucide-react'

import LoadingOverlay from './LoadingOverlay'

// Zod validation schema
const bookUploadSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    author: z.string().min(1, 'Author name is required').max(200, 'Author name is too long'),
    pdfFile: z.instanceof(File).refine(file => file.size <= 50 * 1024 * 1024, {
        message: 'PDF file must be less than 50MB'
    }).refine(file => file.type === 'application/pdf', {
        message: 'File must be a PDF'
    }),
    coverImage: z.instanceof(File).optional().refine(
        file => !file || file.type.startsWith('image/'),
        'Cover must be an image file'
    ),
    voiceType: z.enum(['dave', 'daniel', 'chris', 'rachel', 'sarah']).refine(val => val !== undefined, {
        message: 'Please select a voice type'
    })
})

type BookUploadFormData = z.infer<typeof bookUploadSchema>

const VOICES = {
    male: [
        {id: 'dave', name: 'Dave', description: 'Deep, authoritative voice'},
        {id: 'daniel', name: 'Daniel', description: 'Clear, professional tone'},
        {id: 'chris', name: 'Chris', description: 'Friendly, approachable voice'}
    ],
    female: [
        {id: 'rachel', name: 'Rachel', description: 'Warm, engaging voice'},
        {id: 'sarah', name: 'Sarah', description: 'Calm, soothing tone'},
    ]
}

const UploadForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [isDraggingPdf, setIsDraggingPdf] = useState(false);
    const [isDraggingCover, setIsDraggingCover] = useState(false);


    const pdfInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {errors},
        reset
    } = useForm<BookUploadFormData>({
        resolver: zodResolver(bookUploadSchema),
        mode: 'onBlur',
        defaultValues: {
            voiceType: 'dave',
        }
    })

    const selectedVoice = watch('voiceType')


// ─── Shared file validation & set logic ───
    const processFile = (
        file: File | undefined,
        type: 'pdf' | 'cover',
        setter: React.Dispatch<React.SetStateAction<File | null>>,
    ) => {
        if (!file) return
        if (type === 'pdf') {
            if (file.type !== 'application/pdf') return alert('Please drop a PDF file')
            if (file.size > 50 * 1024 * 1024) return alert('PDF must be ≤ 50MB')
            setValue('pdfFile', file, {shouldValidate: true})
            setter(file)
        } else {
            if (!file.type.startsWith('image/')) return alert('Please drop an image file')
            setValue('coverImage', file, {shouldValidate: true})
            setter(file)
        }
    }

    // ─── PDF Dropzone handlers ───
    const handlePdfDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingPdf(true)
    }

    const handlePdfDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingPdf(false)
    }

    const handlePdfDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingPdf(false)
        const file = e.dataTransfer.files?.[0]
        processFile(file, 'pdf', setPdfFile)
    }

    // ─── Cover Dropzone handlers ───
    const handleCoverDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingCover(true)
    }

    const handleCoverDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingCover(false)
    }

    const handleCoverDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingCover(false)
        const file = e.dataTransfer.files?.[0]
        processFile(file, 'cover', setCoverImage)
    }

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPdfFile(file)
            setValue('pdfFile', file, {shouldValidate: true})
        }
    }

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCoverImage(file)
            setValue('coverImage', file, {shouldValidate: true})
        }
    }

    const removePdf = () => {
        setPdfFile(null)
        if (pdfInputRef.current) {
            pdfInputRef.current.value = ''
        }
        setValue('pdfFile', undefined as any)
    }

    const removeCover = () => {
        setCoverImage(null)
        if (coverInputRef.current) {
            coverInputRef.current.value = ''
        }
        setValue('coverImage', undefined)
    }

    const onSubmit = async (data: BookUploadFormData) => {
        setIsLoading(true)
        try {
            // Simulate API call - replace with actual upload logic
            await new Promise(resolve => setTimeout(resolve, 2000))
            console.log('Form submitted:', data)
            // Here you would typically send the data to your backend
            alert('Book uploaded successfully!')
            reset()
            setPdfFile(null)
            setCoverImage(null)
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Failed to upload book')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <LoadingOverlay isLoading={isLoading} message="Processing your book..."/>

            <form onSubmit={handleSubmit(onSubmit)} className="new-book-wrapper">
                {/* PDF Upload Section */}
                <div className="space-y-4">
                    <label className="form-label">PDF File</label>
                    <input
                        ref={pdfInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfChange}
                        className="hidden"
                    />
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Upload PDF file"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                +e.preventDefault()
                                pdfInputRef.current?.click()
                            }
                        }}
                        onClick={() => pdfInputRef.current?.click()}
                        onDragOver={handlePdfDragOver}
                        onDragLeave={handlePdfDragLeave}
                        onDrop={handlePdfDrop}
                        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer
                        ${isDraggingPdf
                            ? 'border-dashed border-brand bg-brand-50/60 shadow-lg scale-[1.01]'
                            : pdfFile
                                ? 'border-brand bg-brand-50/40'
                                : 'border-dashed border-brand hover:border-brand bg-amber-50/50 hover:bg-gray-100'
                        } min-h-[160px] flex items-center justify-center p-8 mb-12`}
                    >
                        {pdfFile ? (
                            <div className="flex items-center justify-between w-full px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <FileIcon className="w-6 h-6 text-brand"/>
                                    <div className="text-left">
                                        <p className="text-brand font-medium">{pdfFile.name}</p>
                                        <p className="text-xs text-[#8B7355]">
                                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removePdf()
                                    }}
                                    className="upload-dropzone-remove"
                                >
                                    <X className="w-4 h-4"/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload className="upload-dropzone-icon"/>
                                <p className="upload-dropzone-text">{isDraggingPdf ? 'Drop PDF here' : 'Drag & drop PDF or click to browse'}</p>
                                <p className="upload-dropzone-hint">PDF file (max 50MB)</p>
                            </div>
                        )}
                    </div>
                    {errors.pdfFile && (
                        <p className="form-error">{errors.pdfFile.message}</p>
                    )}
                </div>

                {/* Cover Image Upload Section */}
                <div className="space-y-2">
                    <label className="form-label">Cover Image (optional)</label>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                    />
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Upload PDF file"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                +e.preventDefault()
                                pdfInputRef.current?.click()
                            }
                        }}
                        onClick={() => coverInputRef.current?.click()}
                        onDragOver={handleCoverDragOver}
                        onDragLeave={handleCoverDragLeave}
                        onDrop={handleCoverDrop}
                        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${isDraggingCover
                            ? 'border-dashed border-brand bg-brand-50/60 shadow-lg scale-[1.01]'
                            : coverImage
                                ? 'border-brand bg-brand-50/40'
                                : 'border-dashed border-brand hover:border-brand bg-amber-50/50 hover:bg-brand-50/50'
                        } min-h-[160px] flex items-center justify-center p-8`}
                    >
                        {coverImage ? (
                            <div className="flex w-full items-center justify-between gap-4 px-4">
                                <div className="flex items-center gap-4">
                                    <ImageIcon className="upload-dropzone-icon"/>
                                    <div className="min-w-0">
                                        <p className="upload-dropzone-text">{coverImage.name}</p>
                                        <p className="upload-dropzone-hint">
                                            {(coverImage.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeCover()
                                    }}
                                    className="upload-dropzone-remove"
                                >
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <ImageIcon className="upload-dropzone-icon"/>
                                <p className="upload-dropzone-text">
                                    {isDraggingCover ? 'Drop image here' : 'Drag & drop image or click to browse'}
                                </p>
                                <p className="upload-dropzone-hint">Optional • JPG, PNG • Auto-generated if
                                    empty</p>
                            </div>
                        )}
                    </div>
                    {errors.coverImage && <p className="form-error mt-1.5">{errors.coverImage.message}</p>}
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        id="title"
                        type="text"
                        placeholder="ex: Rich Dad Poor Dad"
                        className="form-input"
                        {...register('title')}
                    />
                    {errors.title && (
                        <p className="form-error">{errors.title.message}</p>
                    )}
                </div>

                {/* Author Input */}
                <div className="space-y-2">
                    <label htmlFor="author" className="form-label">Author Name</label>
                    <input
                        id="author"
                        type="text"
                        placeholder="ex: Robert Kiyosaki"
                        className="form-input"
                        {...register('author')}
                    />
                    {errors.author && (
                        <p className="form-error">{errors.author.message}</p>
                    )}
                </div>

                {/* Voice Selector */}
                <div className="space-y-4">
                    <label className="form-label">Choose Assistant Voice</label>

                    {/* Male Voices */}
                    <div className="space-y-4">
                        <p className="text-sm font-semibold text-gray-800 ml-1 mt-6">Male Voices</p>
                        <div className="space-y-2 grid grid-cols-3 gap-4">
                            {VOICES.male.map(voice => {
                                const isSelected = selectedVoice === voice.id
                                return (
                                    <label
                                        key={voice.id}
                                        className={`voice-selector-option ${
                                            isSelected
                                                ? 'voice-selector-option-selected'
                                                : 'voice-selector-option-default'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value={voice.id}
                                            {...register('voiceType')}
                                            className="sr-only"
                                        />
                                        <div className="flex-shrink-0">
                                            {isSelected ? (
                                                <CheckCircle2 className="w-6 h-6 text-brand"/>
                                            ) : (
                                                <Circle
                                                    className="w-6 h-6 text-gray-400 group-hover:text-brand/60"/>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-[#212a3b]">{voice.name}</p>
                                            <p className="text-sm text-[#3d485e]">{voice.description}</p>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {/* Female Voices */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-[#212a3b] ml-1">Female Voices</p>
                        <div className="space-y-2 grid grid-cols-2 gap-4">
                            {VOICES.female.map(voice => {
                                const isSelected = selectedVoice === voice.id
                                return (
                                    <label
                                        key={voice.id}
                                        className={`voice-selector-option ${
                                            isSelected
                                                ? 'voice-selector-option-selected'
                                                : 'voice-selector-option-default'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value={voice.id}
                                            {...register('voiceType')}
                                            className="sr-only"
                                        />
                                        <div className="flex-shrink-0">
                                            {isSelected ? (
                                                <CheckCircle2 className="w-6 h-6 text-brand"/>
                                            ) : (
                                                <Circle
                                                    className="w-6 h-6 text-gray-400 group-hover:text-brand/60"/>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-[#212a3b]">{voice.name}</p>
                                            <p className="text-sm text-[#3d485e]">{voice.description}</p>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                    {errors.voiceType && (
                        <p className="form-error">{errors.voiceType.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="form-btn disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Processing...' : 'Begin Synthesis'}
                </button>
            </form>
        </>
    )
}

export default UploadForm
