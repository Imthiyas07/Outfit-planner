import React, { useState, useRef } from 'react';
import { 
  Sparkles, Upload, FileText, Copy, Check, RotateCcw, Loader2, 
  Shirt, Palette, CheckCircle, AlertCircle, User, Info, CheckSquare
} from 'lucide-react';
import { motion } from 'motion/react';

interface ColorCombination {
  shirt: string;
  pant: string;
  bestFor: string;
}

interface WearWiseAnalysisResult {
  detected: {
    skinTone: string;
    shirt: string;
    pant: string;
  };
  recommendedCombinations: ColorCombination[];
  overallRecommendation: string;
}

interface WearWiseProps {
  token: string | null;
}

export default function WearWise({ token }: WearWiseProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WearWiseAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert File to Base64
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG).');
      return;
    }
    
    // Check file size (limit to 5MB to be safe)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Please upload an image smaller than 5MB.');
      return;
    }

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setPreviewUrl(base64String);
      
      // Extract pure base64 content
      const base64Data = base64String.split(',')[1];
      setImageBase64(base64Data);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!imageBase64 || !mimeType) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wearwise/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64,
          mimeType
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze appearance');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while analyzing the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setImageBase64(null);
    setMimeType(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getPlainTextFormatted = () => {
    if (!result) return '';
    
    const combos = result.recommendedCombinations || [];
    const formattedCombos = combos.map((c, index) => {
      return `${index + 1}. 👕 ${c.shirt} Shirt + 👖 ${c.pant} Pant\n   ✔ Best for: ${c.bestFor}`;
    }).join('\n\n');

    return `Detected:
- Skin Tone: ${result.detected.skinTone}
- Shirt: ${result.detected.shirt}
- Pant: ${result.detected.pant}

Recommended Color Combinations:

${formattedCombos}

Recommendation:
${result.overallRecommendation}`;
  };

  const copyToClipboard = () => {
    const text = getPlainTextFormatted();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8" id="wearwise-container">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase animate-pulse">
              WearWise AI
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Fashion Styling Assistant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Personal Color & Styling Analysis
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Upload your photo to detect your skin tone, shirt color, and pant color. Get instantly personalized color coordination recommendations that naturally complement your appearance.
          </p>
        </div>
      </div>

      {!previewUrl ? (
        /* Upload Area */
        <div 
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[280px] ${
            dragActive 
              ? 'border-black bg-slate-50 scale-[1.01]' 
              : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50'
          }`}
          id="upload-dropzone"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/*"
            className="hidden" 
          />
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 text-slate-500">
            <Upload className="w-8 h-8 text-slate-900" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Upload a high-quality photo
          </h3>
          <p className="text-xs text-slate-500 max-w-sm leading-normal">
            Drag and drop an image showing your face/upper body, or click to browse files.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded">
              PNG, JPG, JPEG
            </span>
            <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded">
              Max 5MB
            </span>
          </div>
        </div>
      ) : (
        /* Preview and Controls */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-3 shadow-sm relative">
              <div className="aspect-[4/5] bg-slate-50 rounded-xl overflow-hidden relative border border-slate-100 flex items-center justify-center">
                <img 
                  src={previewUrl} 
                  alt="Appearance Preview" 
                  className="w-full h-full object-cover"
                />
                
                {loading && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-10 h-10 animate-spin text-white mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest text-center animate-pulse">
                      Analyzing Outfit...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl border border-slate-200 transition-all disabled:opacity-50 cursor-pointer"
                id="reset-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              
              {!result && (
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-2 flex items-center justify-center gap-1.5 bg-black hover:bg-slate-900 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  id="analyze-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" /> Analyze Tone & Style
                </button>
              )}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-150 rounded-xl p-4 flex gap-3 text-rose-700 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <div>
                  <p className="font-bold mb-0.5">Analysis Failed</p>
                  <p className="leading-relaxed text-rose-600/90">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-3">
            {loading ? (
              <div className="h-full min-h-[300px] border border-slate-150 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/40">
                <Loader2 className="w-8 h-8 text-slate-900 animate-spin mb-3" />
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  WearWise AI is analyzing...
                </h4>
                <p className="text-xs text-slate-500 max-w-xs leading-normal">
                  Inspecting facial structures, skin tones, and clothing layers to formulate customized contrast advice.
                </p>
              </div>
            ) : result ? (
              /* Display Results */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
                id="analysis-results"
              >
                {/* Detected Characteristics Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <User className="w-5 h-5 text-slate-900" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Detected Profile
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Skin Tone</span>
                      <span className="text-xs font-extrabold text-slate-900 block">{result.detected.skinTone}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Shirt Color</span>
                      <span className="text-xs font-extrabold text-slate-900 block">{result.detected.shirt}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Pant Color</span>
                      <span className="text-xs font-extrabold text-slate-900 block">{result.detected.pant}</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Color Combinations Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Palette className="w-5 h-5 text-slate-900" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Recommended Color Combinations
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {result.recommendedCombinations.map((combo, i) => (
                      <div key={i} className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="bg-slate-200 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center text-[10px] mr-1">
                            {i + 1}
                          </span>
                          Option {i + 1}
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                            <span className="text-sm">👕</span>
                            <span>{combo.shirt} Shirt</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                            <span className="text-sm">👖</span>
                            <span>{combo.pant} Pant</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="line-clamp-1">Best for: {combo.bestFor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advice Card */}
                <div className="bg-amber-50/40 border border-amber-100 p-4 sm:p-5 rounded-2xl space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
                    <Info className="w-4 h-4 text-amber-700" />
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Recommendation Advice
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {result.overallRecommendation}
                  </p>
                </div>

                {/* Plain Text Report Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-slate-900" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Plain Text Output Report
                      </h3>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Text
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <pre className="text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px]">
                      {getPlainTextFormatted()}
                    </pre>
                  </div>
                </div>

              </motion.div>
            ) : (
              /* Idle Prompt to Analyze */
              <div className="h-full min-h-[300px] border border-slate-150 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/20">
                <Sparkles className="w-8 h-8 text-slate-400 mb-3" />
                <h4 className="text-sm font-bold text-slate-850 mb-1">
                  Ready to Style
                </h4>
                <p className="text-xs text-slate-500 max-w-xs leading-normal">
                  Click <strong className="text-slate-900">"Analyze Tone & Style"</strong> to invoke our WearWise AI model and discover your perfect color matches.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
