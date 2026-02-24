import { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useDropzone } from 'react-dropzone';
import { GenerationResult, AspectRatio, Gender } from '../types';
import { THEMES } from '../constants/config';

interface UseImageGenerationReturn {
  productImage: string | null;
  modelImage: string | null;
  isGenerating: boolean;
  results: GenerationResult[];
  zoomedIndex: number | null;
  gender: Gender;
  selectedTheme: string;
  selectedAspectRatio: AspectRatio;
  description: string;
  getProductProps: any;
  getProductInput: any;
  getModelProps: any;
  getModelInput: any;
  isProductDrag: boolean;
  isModelDrag: boolean;
  setGender: (gender: Gender) => void;
  setSelectedTheme: (theme: string) => void;
  setSelectedAspectRatio: (ratio: AspectRatio) => void;
  setDescription: (desc: string) => void;
  setZoomedIndex: (index: number | null) => void;
  setResults: (results: GenerationResult[]) => void;
  setProductImage: (image: string | null) => void;
  setModelImage: (image: string | null) => void;
  handleGenerate: (userEmail: string | null) => Promise<void>;
  downloadImage: (url: string, id: string) => void;
  nextImage: () => void;
  prevImage: () => void;
}

export const useImageGeneration = (): UseImageGenerationReturn => {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>('female');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('9:16');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  const onDropProduct = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDropModel = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setModelImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps: getProductProps, getInputProps: getProductInput, isDragActive: isProductDrag } = useDropzone({
    onDrop: onDropProduct,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const { getRootProps: getModelProps, getInputProps: getModelInput, isDragActive: isModelDrag } = useDropzone({
    onDrop: onDropModel,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const generateWithRetry = useCallback(async (partIndex: number, retryCount = 0): Promise<GenerationResult | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const themeLabel = THEMES.find(t => t.id === selectedTheme)?.label;

      const basePrompt = `A high-quality, professional fashion photograph of a ${gender === 'female' ? 'female' : 'male'} Vietnamese model, approximately 20 years old, looking young and energetic.
        The model is holding an iPhone 16 Pro Max and taking a selfie in front of a mirror.
        The model is wearing the exact clothing shown in the provided product image.
        ${gender === 'female'
          ? 'The model has long flowing hair, a beautiful tall physique with balanced curves.'
          : 'The model has a stylish side part hairstyle, a fit tall physique with 6-pack abs and broad shoulders.'}
        The setting is a ${themeLabel} environment.
        ${description ? `Additional context: ${description}` : ''}
        The output must be a realistic, high-resolution image with a ${selectedAspectRatio} aspect ratio.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: productImage!.split(',')[1],
                mimeType: 'image/png',
              },
            },
            ...(modelImage ? [{
              inlineData: {
                data: modelImage.split(',')[1],
                mimeType: 'image/png',
              },
            }] : []),
            { text: `${basePrompt} (Variation ${partIndex + 1})` },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedAspectRatio as any,
          },
        },
      });

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          url: `data:image/png;base64,${part.inlineData.data}`
        };
      }
      return null;
    } catch (error: any) {
      if (error.message?.includes('429') || error.status === 429) {
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 2000;
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return generateWithRetry(partIndex, retryCount + 1);
        }
        throw new Error('QUOTA_EXHAUSTED');
      }
      throw error;
    }
  }, [gender, selectedTheme, selectedAspectRatio, description, productImage, modelImage]);

  const handleGenerate = useCallback(async (userEmail: string | null) => {
    if (!userEmail) {
      alert('Vui lòng đăng nhập để sử dụng!');
      return;
    }

    if (!productImage) {
      alert('Vui lòng tải lên ảnh sản phẩm!');
      return;
    }

    if (!window.aistudio && window.aistudio) {
      const confirm = window.confirm('Bạn cần chọn API Key trả phí để tránh giới hạn lượt dùng. Bạn có muốn chọn ngay không?');
      if (confirm) {
        await window.aistudio?.openSelectKey();
        return;
      }
    }

    setIsGenerating(true);
    setResults([]);

    try {
      const newResults: GenerationResult[] = [];

      // Generate 4 results with sequential retries
      for (let i = 0; i < 4; i++) {
        const result = await generateWithRetry(i);
        if (result) {
          newResults.push(result);
          setResults(prev => [...prev, result]);
        }
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      if (error.message === 'QUOTA_EXHAUSTED') {
        alert('Bạn đã hết hạn mức sử dụng (429). Vui lòng đợi một lát hoặc kết nối API Key trả phí của riêng bạn trong phần cài đặt.');
      } else {
        alert('Đã có lỗi xảy ra trong quá trình tạo ảnh. Vui lòng thử lại.');
      }
    } finally {
      setIsGenerating(false);

      // Increment usage
      if (userEmail) {
        try {
          await fetch('/api/usage/increment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail }),
          });
        } catch (e) {
          console.error('Failed to increment usage', e);
        }
      }
    }
  }, [productImage, generateWithRetry]);

  const downloadImage = useCallback((url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `thu-do-hang-hieu-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const nextImage = useCallback(() => {
    if (zoomedIndex !== null) {
      setZoomedIndex((zoomedIndex + 1) % results.length);
    }
  }, [zoomedIndex, results.length]);

  const prevImage = useCallback(() => {
    if (zoomedIndex !== null) {
      setZoomedIndex((zoomedIndex - 1 + results.length) % results.length);
    }
  }, [zoomedIndex, results.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (zoomedIndex === null) return;

      if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'Escape') {
        setZoomedIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedIndex, results.length, nextImage, prevImage]);

  return {
    productImage,
    modelImage,
    isGenerating,
    results,
    zoomedIndex,
    gender,
    selectedTheme,
    selectedAspectRatio,
    description,
    getProductProps,
    getProductInput,
    getModelProps,
    getModelInput,
    isProductDrag,
    isModelDrag,
    setGender,
    setSelectedTheme,
    setSelectedAspectRatio,
    setDescription,
    setZoomedIndex,
    setResults,
    setProductImage,
    setModelImage,
    handleGenerate,
    downloadImage,
    nextImage,
    prevImage,
  };
};
