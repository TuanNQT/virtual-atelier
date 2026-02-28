import React, { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { useAdmin } from "./hooks/useAdmin";
import { LoginForm } from "./components/auth/LoginForm";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ControlPanelSheet } from "./components/layout/ControlPanelSheet";
import { ControlPanel } from "./components/generator/ControlPanel";
import { ResultsGallery } from "./components/gallery/ResultsGallery";
import { ImageCarousel } from "./components/gallery/ImageCarousel";
import { AdminPage } from "./components/admin/AdminPage";
import { Sparkles } from "lucide-react";

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
  const ig = useImageGeneration(userEmail);
  const { isAdmin, currentView, setCurrentView } = useAdmin(userEmail);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    if (window.aistudio) window.aistudio.hasSelectedApiKey().then(setHasApiKey);
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  if (!userEmail)
    return (
      <LoginForm
        isVerifying={isVerifying}
        authError={authError}
        emailInput={emailInput}
        onEmailChange={setEmailInput}
        onSubmit={handleVerifyEmail}
      />
    );

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-16 pb-24 md:pb-16">
        {currentView === "admin" && isAdmin ? (
          <AdminPage adminEmail={userEmail} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              {/* Desktop: ControlPanel inline */}
              <div className="hidden md:block lg:col-span-5">
                <ControlPanel
                  productImage={ig.productImage}
                  modelImage={ig.modelImage}
                  gender={ig.gender}
                  selectedTheme={ig.selectedTheme}
                  selectedAspectRatio={ig.selectedAspectRatio}
                  selectedPose={ig.selectedPose}
                  description={ig.description}
                  isGenerating={ig.isGenerating}
                  history={ig.history}
                  onProductDrop={ig.getProductProps()}
                  onProductInput={ig.getProductInput()}
                  onModelDrop={ig.getModelProps()}
                  onModelInput={ig.getModelInput()}
                  isProductDrag={ig.isProductDrag}
                  isModelDrag={ig.isModelDrag}
                  onProductRemove={() => ig.setProductImage(null)}
                  onModelRemove={() => ig.setModelImage(null)}
                  onProductPaste={ig.setProductImage}
                  onModelPaste={ig.setModelImage}
                  onGenderChange={ig.setGender}
                  onThemeChange={ig.setSelectedTheme}
                  onAspectRatioChange={ig.setSelectedAspectRatio}
                  onPoseChange={ig.setSelectedPose}
                  onDescriptionChange={ig.setDescription}
                  onGenerate={() => ig.handleGenerate(userEmail)}
                  onLoadSession={ig.loadSession}
                  onClearHistory={ig.clearHistory}
                />
              </div>

              {/* Results: full width on mobile, col 7 on desktop */}
              <div className="min-w-0 lg:col-span-7 order-first md:order-none">
                <ResultsGallery
                  results={ig.results}
                  isGenerating={ig.isGenerating}
                  selectedAspectRatio={ig.selectedAspectRatio}
                  selectedTheme={ig.selectedTheme}
                  onItemClick={ig.setZoomedIndex}
                  onDownload={ig.downloadImage}
                  onRegenerate={(i) => ig.handleRegenerate(i, userEmail)}
                  onDownloadAll={ig.downloadAll}
                />
              </div>
            </div>

            {/* Mobile: FAB + Bottom sheet */}
            <div className="md:hidden fixed bottom-6 right-6 z-40">
              <button
                type="button"
                onClick={() => setMobileSheetOpen(true)}
                className="w-14 h-14 rounded-full bg-[#1a1a1a] text-white shadow-xl shadow-black/25 flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all"
              >
                <Sparkles className="w-6 h-6" />
              </button>
            </div>

            <ControlPanelSheet
              isOpen={mobileSheetOpen}
              onClose={() => setMobileSheetOpen(false)}
              title="Tạo mẫu"
            >
              <div className="px-4 py-6">
                <ControlPanel
                  productImage={ig.productImage}
                  modelImage={ig.modelImage}
                  gender={ig.gender}
                  selectedTheme={ig.selectedTheme}
                  selectedAspectRatio={ig.selectedAspectRatio}
                  selectedPose={ig.selectedPose}
                  description={ig.description}
                  isGenerating={ig.isGenerating}
                  history={ig.history}
                  onProductDrop={ig.getProductProps()}
                  onProductInput={ig.getProductInput()}
                  onModelDrop={ig.getModelProps()}
                  onModelInput={ig.getModelInput()}
                  isProductDrag={ig.isProductDrag}
                  isModelDrag={ig.isModelDrag}
                  onProductRemove={() => ig.setProductImage(null)}
                  onModelRemove={() => ig.setModelImage(null)}
                  onProductPaste={ig.setProductImage}
                  onModelPaste={ig.setModelImage}
                  onGenderChange={ig.setGender}
                  onThemeChange={ig.setSelectedTheme}
                  onAspectRatioChange={ig.setSelectedAspectRatio}
                  onPoseChange={ig.setSelectedPose}
                  onDescriptionChange={ig.setDescription}
                  onGenerate={async () => {
                    await ig.handleGenerate(userEmail);
                    setMobileSheetOpen(false);
                  }}
                  onLoadSession={(s) => {
                    ig.loadSession(s);
                    setMobileSheetOpen(false);
                  }}
                  onClearHistory={ig.clearHistory}
                />
              </div>
            </ControlPanelSheet>
          </>
        )}
      </main>

      <ImageCarousel
        isOpen={ig.zoomedIndex !== null}
        currentIndex={ig.zoomedIndex}
        results={ig.results}
        aspectRatio={ig.selectedAspectRatio}
        selectedTheme={ig.selectedTheme}
        onClose={() => ig.setZoomedIndex(null)}
        onNext={ig.nextImage}
        onPrev={ig.prevImage}
        onDownload={ig.downloadImage}
        onRegenerate={(i) => ig.handleRegenerate(i, userEmail)}
      />

      <Footer />
    </div>
  );
}
