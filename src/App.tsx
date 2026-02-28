import React, { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { useAdmin } from "./hooks/useAdmin";
import { LoginForm } from "./components/auth/LoginForm";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ControlPanel } from "./components/generator/ControlPanel";
import { ResultsGallery } from "./components/gallery/ResultsGallery";
import { ImageCarousel } from "./components/gallery/ImageCarousel";
import { AdminPage } from "./components/admin/AdminPage";

export default function App() {
  const {
    userEmail,
    isVerifying,
    authError,
    emailInput,
    setEmailInput,
    handleVerifyEmail,
    handleLogout,
  } = useAuth();
  const imageGeneration = useImageGeneration();
  const { isAdmin, currentView, setCurrentView } = useAdmin(userEmail);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // --- API Key Check ---
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  // Show login form if not authenticated
  if (!userEmail) {
    return (
      <LoginForm
        isVerifying={isVerifying}
        authError={authError}
        emailInput={emailInput}
        onEmailChange={setEmailInput}
        onSubmit={handleVerifyEmail}
      />
    );
  }

  // Main app layout
  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#1a1a1a] font-sans selection:bg-orange-100">
      <Header
        userEmail={userEmail}
        isAdmin={isAdmin}
        currentView={currentView}
        hasApiKey={hasApiKey}
        onLogout={handleLogout}
        onSelectKey={handleSelectKey}
        onViewChange={setCurrentView}
      />

      <main className="max-w-7xl mx-auto px-8 py-16">
        {currentView === "admin" && isAdmin ? (
          <AdminPage adminEmail={userEmail} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <ControlPanel
              productImage={imageGeneration.productImage}
              modelImage={imageGeneration.modelImage}
              gender={imageGeneration.gender}
              selectedTheme={imageGeneration.selectedTheme}
              selectedAspectRatio={imageGeneration.selectedAspectRatio}
              description={imageGeneration.description}
              isGenerating={imageGeneration.isGenerating}
              onProductDrop={imageGeneration.getProductProps()}
              onProductInput={imageGeneration.getProductInput()}
              onModelDrop={imageGeneration.getModelProps()}
              onModelInput={imageGeneration.getModelInput()}
              isProductDrag={imageGeneration.isProductDrag}
              isModelDrag={imageGeneration.isModelDrag}
              onProductRemove={() => imageGeneration.setProductImage(null)}
              onModelRemove={() => imageGeneration.setModelImage(null)}
              onProductPaste={(dataUrl) =>
                imageGeneration.setProductImage(dataUrl)
              }
              onModelPaste={(dataUrl) => imageGeneration.setModelImage(dataUrl)}
              onGenderChange={imageGeneration.setGender}
              onThemeChange={imageGeneration.setSelectedTheme}
              onAspectRatioChange={imageGeneration.setSelectedAspectRatio}
              onDescriptionChange={imageGeneration.setDescription}
              onGenerate={() => imageGeneration.handleGenerate(userEmail)}
            />

            <div className="lg:col-span-7">
              <ResultsGallery
                results={imageGeneration.results}
                isGenerating={imageGeneration.isGenerating}
                selectedAspectRatio={imageGeneration.selectedAspectRatio}
                onItemClick={imageGeneration.setZoomedIndex}
                onDownload={imageGeneration.downloadImage}
              />
            </div>
          </div>
        )}
      </main>

      <ImageCarousel
        isOpen={imageGeneration.zoomedIndex !== null}
        currentIndex={imageGeneration.zoomedIndex}
        results={imageGeneration.results}
        aspectRatio={imageGeneration.selectedAspectRatio}
        onClose={() => imageGeneration.setZoomedIndex(null)}
        onNext={imageGeneration.nextImage}
        onPrev={imageGeneration.prevImage}
        onDownload={() => {
          if (imageGeneration.zoomedIndex !== null) {
            imageGeneration.downloadImage(
              imageGeneration.results[imageGeneration.zoomedIndex].url,
              imageGeneration.results[imageGeneration.zoomedIndex].id,
            );
          }
        }}
      />

      <Footer />
    </div>
  );
}
