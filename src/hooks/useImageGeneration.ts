import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { GenerationResult, AspectRatio, Gender } from '../types';
import { THEMES } from '../constants/config';

const TOKEN_KEY = 'auth_token';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

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
  getProductProps: ReturnType<typeof useDropzone>['getRootProps'];
  getProductInput: ReturnType<typeof useDropzone>['getInputProps'];
  getModelProps: ReturnType<typeof useDropzone>['getRootProps'];
  getModelInput: ReturnType<typeof useDropzone>['getInputProps'];
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
    multiple: false,
  } as Parameters<typeof useDropzone>[0]);

  const { getRootProps: getModelProps, getInputProps: getModelInput, isDragActive: isModelDrag } = useDropzone({
    onDrop: onDropModel,
    accept: { 'image/*': [] },
    multiple: false,
  } as Parameters<typeof useDropzone>[0]);

  // ── Gọi server thay vì gọi Gemini trực tiếp ──────────────────────────────
  const generateSingle = useCallback(
    async (variationIndex: number, retryCount = 0): Promise<GenerationResult | null> => {
      const themeLabel = THEMES.find((t) => t.id === selectedTheme)?.label;

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            productImageBase64: productImage!.split(',')[1],
            modelImageBase64: modelImage ? modelImage.split(',')[1] : null,
            gender,
            themeLabel,
            selectedAspectRatio,
            description,
            variationIndex,
          }),
        });

        if (response.status === 429) {
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 2000;
            await new Promise((r) => setTimeout(r, delay));
            return generateSingle(variationIndex, retryCount + 1);
          }
          throw new Error('QUOTA_EXHAUSTED');
        }

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Lỗi server');
        }

        const data = await response.json();
        return {
          id: Math.random().toString(36).substr(2, 9),
          url: `data:image/png;base64,${data.imageBase64}`,
        };
      } catch (error) {
        throw error;
      }
    },
    [gender, selectedTheme, selectedAspectRatio, description, productImage, modelImage]
  );

  const handleGenerate = useCallback(
    async (userEmail: string | null) => {
      if (!userEmail) {
        alert('Vui lòng đăng nhập để sử dụng!');
        return;
      }
      if (!productImage) {
        alert('Vui lòng tải lên ảnh sản phẩm!');
        return;
      }

      // ✅ Fix logic check API key (was: !window.aistudio && window.aistudio — never true)
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          const confirmed = window.confirm(
            'Bạn chưa chọn API Key trả phí. Bạn có muốn chọn ngay không?'
          );
          if (confirmed) {
            await window.aistudio.openSelectKey();
            return;
          }
        }
      }

      setIsGenerating(true);
      setResults([]);

      let successCount = 0;

      try {
        // ✅ Generate 4 ảnh SONG SONG thay vì tuần tự — nhanh ~4x
        const promises = [0, 1, 2, 3].map((i) =>
          generateSingle(i).then((result) => {
            if (result) {
              setResults((prev) => [...prev, result]);
              successCount++;
            }
            return result;
          })
        );

        await Promise.allSettled(promises);
      } catch (error: any) {
        console.error('Generation failed:', error);
        if (error.message === 'QUOTA_EXHAUSTED') {
          alert('Bạn đã hết hạn mức sử dụng (429). Vui lòng đợi một lát hoặc kết nối API Key trả phí.');
        } else {
          alert('Đã có lỗi xảy ra trong quá trình tạo ảnh. Vui lòng thử lại.');
        }
      } finally {
        setIsGenerating(false);

        // ✅ Chỉ tăng usage khi có ít nhất 1 ảnh thành công
        if (successCount > 0) {
          fetch('/api/usage/increment', {
            method: 'POST',
            headers: getAuthHeaders(),
          }).catch((e) => console.error('Failed to increment usage', e));
        }
      }
    },
    [productImage, generateSingle]
  );

  const downloadImage = useCallback((url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `thu-do-hang-hieu-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const nextImage = useCallback(() => {
    if (zoomedIndex !== null) setZoomedIndex((zoomedIndex + 1) % results.length);
  }, [zoomedIndex, results.length]);

  const prevImage = useCallback(() => {
    if (zoomedIndex !== null) setZoomedIndex((zoomedIndex - 1 + results.length) % results.length);
  }, [zoomedIndex, results.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (zoomedIndex === null) return;
      if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
      else if (e.key === 'Escape') setZoomedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedIndex, nextImage, prevImage]);

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
