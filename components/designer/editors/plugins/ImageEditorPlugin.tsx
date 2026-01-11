
import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Crop, Save, Upload, RotateCcw, 
  Image as ImageIcon, Check, X, Smartphone, Monitor, Square, Type
} from 'lucide-react';

interface ImageEditorPluginProps {
  initialImage?: string;
  onSave: (newImageBase64: string) => void;
}

export const ImageEditorPlugin: React.FC<ImageEditorPluginProps> = ({ initialImage, onSave }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  
  // Crop Dimensions State
  const [cropSize, setCropSize] = useState({ width: 800, height: 600 });
  const [tempCropSize, setTempCropSize] = useState({ width: 800, height: 600 }); // For inputs

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        resetTransform();
      };
      reader.readAsDataURL(file);
    }
  };

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const applyPreset = (w: number, h: number) => {
      setTempCropSize({ width: w, height: h });
      setCropSize({ width: w, height: h });
  };

  const handleBlurDimensions = () => {
      // Basic validation
      const w = Math.max(50, tempCropSize.width);
      const h = Math.max(50, tempCropSize.height);
      setTempCropSize({ width: w, height: h });
      setCropSize({ width: w, height: h });
  };

  // Pan Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCropping) return;
    setIsDragging(true);
    setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isCropping) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom Logic
  const handleWheel = (e: React.WheelEvent) => {
    if (!isCropping) return;
    e.stopPropagation(); 
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 5);
    setScale(newScale);
  };

  // Crop & Save Logic
  const handleCropAndSave = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // The canvas size is exactly the requested crop size
    canvas.width = cropSize.width;
    canvas.height = cropSize.height;

    // Background color (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = imageRef.current;
    
    // Calculate draw parameters
    // The visual logic: The user sees a viewport of size `cropSize`.
    // The image is centered in that viewport, then translated by `position`, then scaled by `scale`.
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const resultBase64 = canvas.toDataURL('image/png');
    onSave(resultBase64);
    setIsCropping(false);
    setImageSrc(resultBase64);
    resetTransform();
  };

  // Calculate visual style for the container to fit in the screen while maintaining aspect ratio
  const getContainerStyle = () => {
      if (!isCropping) return { width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' };

      // We want to display the crop area scaled down if it's too big for the screen
      // but the aspect ratio must match cropSize.width / cropSize.height
      
      const availableW = editorWrapperRef.current?.clientWidth || 800;
      const availableH = editorWrapperRef.current?.clientHeight || 600;
      const padding = 40;

      const scaleW = (availableW - padding) / cropSize.width;
      const scaleH = (availableH - padding) / cropSize.height;
      
      const fitScale = Math.min(scaleW, scaleH, 1); // Never scale up visually above 1x to avoid blurriness confusion, or allow if desired. Let's cap at 1x for crispness, or just fit.
      // Actually for "Crop", seeing the whole area is important.
      const finalScale = Math.min(scaleW, scaleH);

      return {
          width: cropSize.width * finalScale,
          height: cropSize.height * finalScale,
          // We need to scale the *content* logic inversely? 
          // No, this div is just a window. We need to ensure the visual representation of the image inside matches.
          // Since we are resizing the container DOM element, we don't need to scale the image css transform for this fitting.
          // BUT, if we shrink the container, the pixels shrink.
          // To keep 1:1 pixel mapping logic simple, we can use CSS transform scale on the container itself?
          // Let's try just setting W/H. The image inside is absolutely positioned.
      };
  };

  // We actually need to handle the visual scaling carefully. 
  // If the user wants an 800x600 output, but their screen is 400x300, 
  // we show a 400x300 box. If the image is 1000x1000, 
  // we need to make sure the visual feedback aligns with the output.
  // Simplest approach: The container IS the crop size in CSS pixels, and we use CSS zoom/scale to fit it in the UI.
  const containerStyle = getContainerStyle();
  const visualScale = isCropping ? (containerStyle.width as number) / cropSize.width : 1;

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0 z-10 gap-4">
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap"
            >
                <Upload size={14} /> Upload
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            
            {isCropping ? (
                <>
                    <div className="flex items-center gap-2 mr-2">
                        <span className="text-xs text-gray-500 font-medium">Output Size:</span>
                        <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-1">
                            <input 
                                type="number" 
                                value={tempCropSize.width}
                                onChange={(e) => setTempCropSize({ ...tempCropSize, width: parseInt(e.target.value) || 0 })}
                                onBlur={handleBlurDimensions}
                                className="w-12 py-1 text-xs bg-transparent outline-none text-center"
                            />
                            <span className="text-xs text-gray-400 px-1">x</span>
                            <input 
                                type="number" 
                                value={tempCropSize.height}
                                onChange={(e) => setTempCropSize({ ...tempCropSize, height: parseInt(e.target.value) || 0 })}
                                onBlur={handleBlurDimensions}
                                className="w-12 py-1 text-xs bg-transparent outline-none text-center"
                            />
                        </div>
                    </div>

                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded p-0.5">
                        <button onClick={() => applyPreset(500, 500)} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300" title="1:1 Square">
                            <Square size={14} />
                        </button>
                        <button onClick={() => applyPreset(800, 450)} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300" title="16:9 Landscape">
                            <Monitor size={14} />
                        </button>
                        <button onClick={() => applyPreset(450, 800)} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300" title="9:16 Mobile">
                            <Smartphone size={14} />
                        </button>
                    </div>

                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2"></div>

                    <button 
                        onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                        title="Zoom Out"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="3" 
                        step="0.1" 
                        value={scale} 
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-20 accent-nebula-600"
                    />
                    <button 
                        onClick={() => setScale(s => Math.min(5, s + 0.1))}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
                        title="Zoom In"
                    >
                        <ZoomIn size={16} />
                    </button>
                </>
            ) : (
                <span className="text-xs text-gray-400">Preview Mode</span>
            )}
         </div>

         <div className="flex items-center gap-2 whitespace-nowrap">
            {!isCropping ? (
                <button 
                    onClick={() => { setIsCropping(true); resetTransform(); }}
                    disabled={!imageSrc}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-nebula-600 text-white hover:bg-nebula-700 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Crop size={14} /> Edit / Crop
                </button>
            ) : (
                <>
                    <button 
                        onClick={() => setIsCropping(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-xs font-medium"
                    >
                        <X size={14} /> Cancel
                    </button>
                    <button 
                        onClick={handleCropAndSave}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded text-xs font-medium"
                    >
                        <Check size={14} /> Save
                    </button>
                </>
            )}
         </div>
      </div>

      {/* Editor Canvas */}
      <div 
        ref={editorWrapperRef}
        className="flex-1 overflow-hidden relative bg-[#1e1e1e] flex items-center justify-center select-none p-4"
      >
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#4a4a4a_1px,transparent_1px)] [background-size:16px_16px]"></div>
         
         {imageSrc ? (
             <div 
                ref={containerRef}
                style={isCropping ? { 
                    width: cropSize.width, 
                    height: cropSize.height,
                    transform: `scale(${visualScale})`,
                    transformOrigin: 'center center'
                } : {}}
                className={`relative overflow-hidden shadow-2xl border-2 border-gray-700 bg-black ${isCropping ? 'cursor-move flex-shrink-0' : 'w-auto h-auto max-w-full max-h-full object-contain'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
             >
                {/* Image */}
                <img 
                    ref={imageRef}
                    src={imageSrc} 
                    alt="Editable" 
                    draggable={false}
                    className={`max-w-none origin-center transition-transform duration-75 ${!isCropping ? 'max-w-full max-h-full object-contain' : ''}`}
                    style={isCropping ? {
                        transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0) scale(${scale})`,
                        position: 'absolute',
                        top: '50%',
                        left: '50%'
                    } : {}}
                />
                
                {/* Crop Overlay Guidelines (Only in crop mode) */}
                {isCropping && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-nebula-500/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]">
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-nebula-500/30"></div>
                        <div className="absolute bottom-1/3 left-0 right-0 h-px bg-nebula-500/30"></div>
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-nebula-500/30"></div>
                        <div className="absolute right-1/3 top-0 bottom-0 w-px bg-nebula-500/30"></div>
                        {/* Size Label */}
                        <div 
                            className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm"
                            style={{ transform: `scale(${1/visualScale})`, transformOrigin: 'bottom right' }}
                        >
                            {cropSize.width} x {cropSize.height}
                        </div>
                    </div>
                )}
             </div>
         ) : (
             <div className="text-center text-gray-500">
                 <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                 <p>No image selected</p>
                 <button onClick={() => fileInputRef.current?.click()} className="mt-4 text-nebula-500 hover:underline">Click to Upload</button>
             </div>
         )}
      </div>
    </div>
  );
};
