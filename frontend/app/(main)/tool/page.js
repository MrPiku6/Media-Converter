'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

import Header from '@/app/components/Header';
import OptionGroup from '@/app/components/OptionGroup';
import ProgressBar from '@/app/components/ProgressBar';

// Data for our dropdowns
const formats = ["mp4", "mkv", "avi", "webm", "mov", "flv", "gif"];
const videoCodecs = ["libx264", "libx265", "libaom-av1", "libvpx-vp9"];
const audioCodecs = ["aac", "mp3", "opus", "vorbis", "flac"];

export default function ToolPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    // File and upload state
    const [file, setFile] = useState(null);
    const [uploadedFileId, setUploadedFileId] = useState(null);
    
    // UI and Process State
    const [isUploading, setIsUploading] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [jobId, setJobId] = useState(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [downloadUrl, setDownloadUrl] = useState(null);

    // Conversion Options State
    const [options, setOptions] = useState({
        format: 'mp4',
        videoCodec: 'libx264',
        audioCodec: 'aac',
        videoBitrate: '',
        trim: { start: '', duration: '' },
        resolution: '',
        framerate: '',
        disableAudio: false,
    });

    // Protect the route
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [user, loading, isAuthenticated, router]);

    // Polling effect for conversion status
    useEffect(() => {
        if (!jobId || isConverting === false) return;

        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/api/media/jobs/status/${jobId}`);
                const job = res.data;

                setProgress(job.progress || 0);
                setStatusText(job.status);
                
                if (job.status === 'completed') {
                    setIsConverting(false);
                    setDownloadUrl(`${process.env.NEXT_PUBLIC_API_URL}/api/downloads/${job.outputFileName}`);
                    toast.success('Conversion Successful!');
                    clearInterval(interval);
                } else if (job.status === 'failed') {
                    setIsConverting(false);
                    toast.error(`Conversion Failed: ${job.error}`);
                    clearInterval(interval);
                }
            } catch (error) {
                setIsConverting(false);
                toast.error('Could not get job status.');
                clearInterval(interval);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [jobId, isConverting]);


    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size > 50 * 1024 * 1024) {
            toast.error('File size must be under 50 MB.');
            setFile(null);
            e.target.value = null; // Reset the file input
            return;
        }
        setFile(selectedFile);
        setUploadedFileId(null);
        setDownloadUrl(null);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first.');
            return;
        }
        setIsUploading(true);
        setStatusText('Uploading...');
        setProgress(0); // You can implement upload progress if needed

        const formData = new FormData();
        formData.append('video', file);

        try {
            const res = await api.post('/api/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadedFileId(res.data.fileId);
            toast.success('File uploaded successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed.');
        } finally {
            setIsUploading(false);
            setStatusText('');
        }
    };
    
    const handleOptionChange = (e) => {
        const { name, value, type, checked } = e.target;
        setOptions(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleConvert = async () => {
        if (!uploadedFileId) {
            toast.error('Please upload a file before converting.');
            return;
        }
        
        setIsConverting(true);
        setDownloadUrl(null);
        setProgress(0);
        setStatusText('Starting conversion...');

        try {
            const res = await api.post('/api/media/convert', {
                fileId: uploadedFileId,
                options: options
            });
            setJobId(res.data.jobId);
            toast.success('Conversion process started...');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start conversion.');
            setIsConverting(false);
        }
    };


    if (loading || !isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">

                    {/* Section 1: File Upload */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">1. Upload Your Video</h2>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 flex-grow"
                            />
                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading || isConverting}
                                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition duration-300 disabled:bg-indigo-400"
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                        {uploadedFileId && <p className="text-green-400 mt-2">✔️ File ready for conversion.</p>}
                    </div>

                    {/* Section 2: Conversion Options */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">2. Choose Conversion Options</h2>
                        <div className="space-y-4">
                            <OptionGroup title="Format & Codecs">
                                <div>
                                    <label className="block text-sm font-medium">Format</label>
                                    <select name="format" value={options.format} onChange={handleOptionChange} className="mt-1 w-full p-2 bg-gray-700 rounded-md">
                                        {formats.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Video Codec</label>
                                    <select name="videoCodec" value={options.videoCodec} onChange={handleOptionChange} className="mt-1 w-full p-2 bg-gray-700 rounded-md">
                                        {videoCodecs.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Audio Codec</label>
                                    <select name="audioCodec" value={options.audioCodec} onChange={handleOptionChange} className="mt-1 w-full p-2 bg-gray-700 rounded-md">
                                        {audioCodecs.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </OptionGroup>
                            
                            {/* Add more OptionGroup sections for other features like Resolution, Trim, etc. */}
                             <OptionGroup title="Audio">
                                <div className="flex items-center col-span-full">
                                    <input type="checkbox" id="disableAudio" name="disableAudio" checked={options.disableAudio} onChange={handleOptionChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <label htmlFor="disableAudio" className="ml-2 block text-sm">Disable Audio (Mute)</label>
                                </div>
                            </OptionGroup>

                        </div>
                    </div>
                    
                    {/* Section 3: Convert & Download */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">3. Convert & Download</h2>
                        <button
                            onClick={handleConvert}
                            disabled={!uploadedFileId || isConverting || isUploading}
                            className="w-full px-8 py-4 text-lg bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition duration-300 disabled:bg-green-400"
                        >
                            {isConverting ? 'Converting...' : 'Start Conversion'}
                        </button>

                        {isConverting && (
                            <ProgressBar progress={progress} statusText={statusText} />
                        )}

                        {downloadUrl && (
                             <div className="mt-4 text-center">
                                <a
                                    href={downloadUrl}
                                    download
                                    className="inline-block w-full px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition duration-300"
                                >
                                    Download Converted File
                                </a>
                                <p className="text-xs text-gray-400 mt-2">Note: Download link is valid for 1 hour.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
