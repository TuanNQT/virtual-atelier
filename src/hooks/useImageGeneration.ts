import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  GenerationResult,
  GenerationSession,
  AspectRatio,
  Gender,
  PoseId,
} from "../types";
import { THEMES, POSES } from "../constants/config";

const TOKEN_KEY = "auth_token";
const HISTORY_KEY = "va_history";
/** Lưu tối đa 10 kết quả gần nhất (mỗi kết quả = 1 session gồm product, model, 4 ảnh). Chỉ lưu URL ImageKit nên không lo quá tải localStorage. */
const MAX_HISTORY_SESSIONS = 10;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

function createThumbnail(dataUrl: string, size = 100): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = img.height / img.width;
      canvas.width = size;
      canvas.height = size * ratio;
      canvas
        .getContext("2d")!
        .drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.5));
    };
    img.onerror = () => resolve("");
    img.src = dataUrl;
  });
}

export interface UseImageGenerationReturn {
  productImage: string | null;
  modelImage: string | null;
  isGenerating: boolean;
  results: GenerationResult[];
  zoomedIndex: number | null;
  gender: Gender;
  selectedTheme: string;
  selectedAspectRatio: AspectRatio;
  selectedPose: PoseId;
  description: string;
  history: GenerationSession[];
  getProductProps: ReturnType<typeof useDropzone>["getRootProps"];
  getProductInput: ReturnType<typeof useDropzone>["getInputProps"];
  getModelProps: ReturnType<typeof useDropzone>["getRootProps"];
  getModelInput: ReturnType<typeof useDropzone>["getInputProps"];
  isProductDrag: boolean;
  isModelDrag: boolean;
  setGender: (g: Gender) => void;
  setSelectedTheme: (t: string) => void;
  setSelectedAspectRatio: (r: AspectRatio) => void;
  setSelectedPose: (p: PoseId) => void;
  setDescription: (d: string) => void;
  setZoomedIndex: (i: number | null) => void;
  setResults: (r: GenerationResult[]) => void;
  setProductImage: (i: string | null) => void;
  setModelImage: (i: string | null) => void;
  handleGenerate: (email: string | null) => Promise<void>;
  handleRegenerate: (index: number, email: string | null) => Promise<void>;
  downloadImage: (url: string, filename: string) => void;
  downloadAll: () => void;
  loadSession: (s: GenerationSession) => void;
  clearHistory: () => void;
  nextImage: () => void;
  prevImage: () => void;
}

export const useImageGeneration = (): UseImageGenerationReturn => {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>("female");
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const [selectedAspectRatio, setSelectedAspectRatio] =
    useState<AspectRatio>("9:16");
  const [selectedPose, setSelectedPose] = useState<PoseId>("selfie");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<GenerationSession[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Không thể lưu lịch sử vào localStorage:", e);
    }
  }, [history]);

  const onDropProduct = useCallback((files: File[]) => {
    const r = new FileReader();
    r.onload = () => setProductImage(r.result as string);
    r.readAsDataURL(files[0]);
  }, []);
  const onDropModel = useCallback((files: File[]) => {
    const r = new FileReader();
    r.onload = () => setModelImage(r.result as string);
    r.readAsDataURL(files[0]);
  }, []);

  const {
    getRootProps: getProductProps,
    getInputProps: getProductInput,
    isDragActive: isProductDrag,
  } = useDropzone({
    onDrop: onDropProduct,
    accept: { "image/*": [] },
    multiple: false,
  } as Parameters<typeof useDropzone>[0]);
  const {
    getRootProps: getModelProps,
    getInputProps: getModelInput,
    isDragActive: isModelDrag,
  } = useDropzone({
    onDrop: onDropModel,
    accept: { "image/*": [] },
    multiple: false,
  } as Parameters<typeof useDropzone>[0]);

  const generateSingle = useCallback(
    async (
      variationIndex: number,
      opts: {
        gender?: Gender;
        themeId?: string;
        aspectRatio?: AspectRatio;
        poseId?: PoseId;
        description?: string;
        productImg?: string;
        modelImg?: string;
      } = {},
      retry = 0,
    ): Promise<GenerationResult | null> => {
      const themeLabel = THEMES.find(
        (t) => t.id === (opts.themeId ?? selectedTheme),
      )?.label;
      const posePrompt =
        POSES.find((p) => p.id === (opts.poseId ?? selectedPose))?.prompt ??
        POSES[0].prompt;
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            productImageBase64: (opts.productImg ?? productImage)!.split(
              ",",
            )[1],
            modelImageBase64:
              (opts.modelImg ?? modelImage)?.split(",")[1] ?? null,
            gender: opts.gender ?? gender,
            themeLabel,
            selectedAspectRatio: opts.aspectRatio ?? selectedAspectRatio,
            description: opts.description ?? description,
            posePrompt,
            variationIndex,
          }),
        });
        if (res.status === 429) {
          if (retry < 3) {
            await new Promise((r) => setTimeout(r, Math.pow(2, retry) * 2000));
            return generateSingle(variationIndex, opts, retry + 1);
          }
          throw new Error("QUOTA_EXHAUSTED");
        }
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || "Lỗi server");
        }
        const data = await res.json();
        return {
          id: Math.random().toString(36).substr(2, 9),
          url: `data:image/png;base64,${data.imageBase64}`,
        };
      } catch (e) {
        throw e;
      }
    },
    [
      gender,
      selectedTheme,
      selectedAspectRatio,
      selectedPose,
      description,
      productImage,
      modelImage,
    ],
  );

  const handleGenerate = useCallback(
    async (email: string | null) => {
      if (!email) {
        alert("Vui lòng đăng nhập!");
        return;
      }
      if (!productImage) {
        alert("Vui lòng tải ảnh sản phẩm!");
        return;
      }
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          if (window.confirm("Chưa chọn API Key. Chọn ngay?")) {
            await window.aistudio.openSelectKey();
            return;
          }
        }
      }
      setIsGenerating(true);
      setResults([]);
      let successCount = 0;
      const newResults: GenerationResult[] = [];
      try {
        await Promise.allSettled(
          [0, 1, 2, 3].map((i) =>
            generateSingle(i).then((r) => {
              if (r) {
                setResults((p) => [...p, r]);
                newResults.push(r);
                successCount++;
              }
            }),
          ),
        );
      } catch (e: any) {
        if (e.message === "QUOTA_EXHAUSTED")
          alert(
            "Hết hạn mức sử dụng. Vui lòng thử lại sau hoặc dùng API Key trả phí.",
          );
      } finally {
        setIsGenerating(false);
        if (successCount > 0) {
          fetch("/api/usage/increment", {
            method: "POST",
            headers: getAuthHeaders(),
          }).catch(() => {});

          // Upload to ImageKit — ảnh sản phẩm, mẫu (nếu có), kết quả. Chỉ lưu URL.
          try {
            const images = newResults.map((r) => ({
              base64: r.url.split(",")[1] ?? "",
              filename: `${r.id}.png`,
            }));

            const uploadRes = await fetch("/api/upload-to-imagekit", {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                images,
                productImage,
                modelImage: modelImage || undefined,
              }),
            });
            if (!uploadRes.ok) throw new Error("Upload failed");
            const data = (await uploadRes.json()) as {
              urls?: string[];
              productImageUrl?: string;
              modelImageUrl?: string;
            };
            const { urls, productImageUrl, modelImageUrl } = data;
            if (!urls || urls.length !== newResults.length) {
              throw new Error("Upload incomplete");
            }
            const resultsWithUrls: GenerationResult[] = newResults.map(
              (r, i) => ({
                ...r,
                url: urls[i],
              }),
            );
            setHistory((prev) =>
              [
                {
                  id: Date.now().toString(),
                  timestamp: Date.now(),
                  results: resultsWithUrls,
                  theme: selectedTheme,
                  gender,
                  aspectRatio: selectedAspectRatio,
                  productImageUrl,
                  modelImageUrl: modelImageUrl ?? undefined,
                },
                ...prev,
              ].slice(0, MAX_HISTORY_SESSIONS),
            );
          } catch {
            // ImageKit fail — không lưu history, app vẫn chạy bình thường
            console.log("Save history failed");
          }
        }
      }
    },
    [
      productImage,
      modelImage,
      generateSingle,
      selectedTheme,
      gender,
      selectedAspectRatio,
    ],
  );

  // #3 Regenerate single image
  const handleRegenerate = useCallback(
    async (index: number, email: string | null) => {
      if (!email || !productImage) return;
      setResults((prev) =>
        prev.map((r, i) => (i === index ? { ...r, isRegenerating: true } : r)),
      );
      try {
        const result = await generateSingle(index);
        if (result)
          setResults((prev) => prev.map((r, i) => (i === index ? result : r)));
      } catch {
        setResults((prev) =>
          prev.map((r, i) =>
            i === index ? { ...r, isRegenerating: false } : r,
          ),
        );
      }
    },
    [productImage, generateSingle],
  );

  // #7 + #13
  const downloadImage = useCallback((url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadAll = useCallback(() => {
    const theme = THEMES.find((t) => t.id === selectedTheme)?.id ?? "photo";
    const date = new Date().toISOString().slice(0, 10);
    results.forEach((r, i) =>
      setTimeout(
        () => downloadImage(r.url, `${theme}-${date}-${i + 1}.png`),
        i * 300,
      ),
    );
  }, [results, selectedTheme, downloadImage]);

  // #1 History
  const loadSession = useCallback((s: GenerationSession) => {
    setResults(s.results);
    setSelectedTheme(s.theme);
    setSelectedAspectRatio(s.aspectRatio);
  }, []);
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const nextImage = useCallback(() => {
    if (zoomedIndex !== null)
      setZoomedIndex((zoomedIndex + 1) % results.length);
  }, [zoomedIndex, results.length]);
  const prevImage = useCallback(() => {
    if (zoomedIndex !== null)
      setZoomedIndex((zoomedIndex - 1 + results.length) % results.length);
  }, [zoomedIndex, results.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoomedIndex === null) return;
      if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "Escape") setZoomedIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
    selectedPose,
    description,
    history,
    getProductProps,
    getProductInput,
    getModelProps,
    getModelInput,
    isProductDrag,
    isModelDrag,
    setGender,
    setSelectedTheme,
    setSelectedAspectRatio,
    setSelectedPose,
    setDescription,
    setZoomedIndex,
    setResults,
    setProductImage,
    setModelImage,
    handleGenerate,
    handleRegenerate,
    downloadImage,
    downloadAll,
    loadSession,
    clearHistory,
    nextImage,
    prevImage,
  };
};
