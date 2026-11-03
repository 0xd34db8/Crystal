"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { RecentFileCard } from "@/components/home/RecentFileCard";
import {
  getSavedSyllabi,
  saveSyllabus,
  setActiveSyllabusId,
  deleteSyllabus,
  getApiKey,
  getAIConfig,
} from "@/lib/storage";
import { parseRawTextToSyllabus, createStarterSyllabus } from "@/lib/parser";
import { formatSyllabusWithAI } from "@/lib/gemini";
import { processSyllabusFile } from "@/lib/fileUtils";
import { SyllabusData } from "@/types/syllabus";
import {
  Upload,
  ArrowRight,
  BookOpen,
  Key,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [syllabi, setSyllabi] = useState<SyllabusData[]>([]);
  const [syllabusName, setSyllabusName] = useState("");
  const [rawText, setRawText] = useState("");
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // AI & Processing state
  const [isFormatting, setIsFormatting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer for loading progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFormatting) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFormatting]);

  // Compute smooth progress percentage based on elapsed seconds
  const progressPct = isFormatting
    ? Math.min(15 + Math.floor(Math.log(elapsedSeconds + 1) * 28), 95)
    : 0;

  // API Key management
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    setSyllabi(getSavedSyllabi());
    setApiKey(getApiKey());
  }, []);

  const handleOpenSyllabus = (id: string) => {
    setActiveSyllabusId(id);
    router.push("/edit");
  };

  const handleDeleteSyllabus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteSyllabus(id);
    setSyllabi(updated);
  };

  const handleSelectedFile = (file: File) => {
    setUploadedFile(file);
    setErrorMessage(null);
    if (!syllabusName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setSyllabusName(cleanName);
    }
  };

  const handleImport = async (useAi = true) => {
    setErrorMessage(null);

    const title =
      syllabusName.trim() ||
      uploadedFile?.name.replace(/\.[^/.]+$/, "") ||
      "New Syllabus";

    // 1. If using AI but no API key configured, prompt user to enter one
    if (useAi && !apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsFormatting(true);
    setStatusMessage(
      useAi
        ? "Formatting syllabus with AI..."
        : "Parsing syllabus locally...",
    );

    try {
      let resultSyllabus: SyllabusData;

      if (activeTab === "file") {
        if (!uploadedFile) {
          throw new Error("Please select or drop a syllabus file first.");
        }

        setStatusMessage("Reading file contents...");
        const processed = await processSyllabusFile(uploadedFile);

        // Pre-structured .crystal or .json file
        if (processed.isJsonOrCrystal && processed.jsonData) {
          resultSyllabus = {
            ...processed.jsonData,
            fileName: title,
            lastModified: "Just now",
          };
        } else if (useAi && apiKey) {
          setStatusMessage("AI is structuring syllabus tree...");
          if (processed.pdfBase64) {
            resultSyllabus = await formatSyllabusWithAI(
              {
                fileData: {
                  base64: processed.pdfBase64,
                  mimeType: "application/pdf",
                },
                preferredTitle: title,
              },
              getAIConfig(),
            );
          } else if (processed.text) {
            resultSyllabus = await formatSyllabusWithAI(
              {
                text: processed.text,
                preferredTitle: title,
              },
              getAIConfig(),
            );
          } else {
            throw new Error("Could not extract readable content from file.");
          }
        } else {
          // Local offline fallback
          resultSyllabus = processed.text
            ? parseRawTextToSyllabus(processed.text, title)
            : createStarterSyllabus(title);
        }
      } else {
        // Tab: Paste Text
        if (!rawText.trim()) {
          throw new Error("Please paste syllabus text to organize.");
        }

        if (useAi && apiKey) {
          setStatusMessage("AI is structuring syllabus topics...");
          resultSyllabus = await formatSyllabusWithAI(
            {
              text: rawText.trim(),
              preferredTitle: title,
            },
            getAIConfig(),
          );
        } else {
          resultSyllabus = parseRawTextToSyllabus(rawText.trim(), title);
        }
      }

      // Save and navigate to editor
      saveSyllabus(resultSyllabus);
      setActiveSyllabusId(resultSyllabus.id);
      router.push("/edit");
    } catch (err: any) {
      setErrorMessage(
        err.message || "An unexpected error occurred while parsing syllabus.",
      );
    } finally {
      setIsFormatting(false);
      setStatusMessage("");
    }
  };

  // Header actions slot: API Key button
  const headerActions = (
    <button
      type="button"
      onClick={() => setIsApiKeyModalOpen(true)}
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-normal transition-all cursor-pointer ${
        apiKey
          ? "bg-emerald-50/90 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
          : "bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400 shadow-2xs"
      }`}
      title="Configure API Key"
    >
      <Key className="w-3.5 h-3.5 text-neutral-600" />
      <span>{apiKey ? "API Key Configured" : "Configure API Key"}</span>
    </button>
  );

  return (
    <main className="h-screen w-full bg-[#F9F9F9] flex flex-col overflow-hidden font-manrope">
      {/* Unified Window Header */}
      <AppHeader actions={headerActions} />

      {/* Main Content Layout: Split Panes (Import & Recents) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 px-6 md:px-8 py-5 overflow-hidden min-h-0">
        {/* Left Column: Import New Syllabus */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-[26px] border border-black/15 shadow-xs p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-light text-neutral-900 tracking-tight">
                  Add New Syllabus
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                PDF, Word (.docx) or .TXT supported
              </p>
            </div>

            {/* Title input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                Syllabus Title
              </label>
              <input
                type="text"
                value={syllabusName}
                onChange={(e) => setSyllabusName(e.target.value)}
                placeholder="e.g. Machine Learning, Cloud Architecture"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-neutral-500 focus:bg-white transition-all font-manrope"
              />
            </div>

            {/* Tab selector */}
            <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("file");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "file"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("text");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === "text"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Paste Text
              </button>
            </div>

            {/* Upload Drop Zone or Text Area */}
            {activeTab === "file" ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleSelectedFile(file);
                }}
                className={`flex flex-col items-center justify-center p-7 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  dragOver
                    ? "border-blue-500 bg-blue-50/50"
                    : uploadedFile
                      ? "border-emerald-300 bg-emerald-50/30"
                      : "border-neutral-200 hover:border-neutral-300 bg-neutral-50/60"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.crystal,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSelectedFile(file);
                  }}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-neutral-600 mb-3 border border-black/5">
                  {uploadedFile ? (
                    <FileText className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Upload className="w-5 h-5 text-neutral-600" />
                  )}
                </div>
                <span className="text-xs font-medium text-neutral-800 text-center truncate max-w-[260px]">
                  {uploadedFile
                    ? uploadedFile.name
                    : "Click or drag & drop syllabus file"}
                </span>
                <span className="text-[10px] text-neutral-400 mt-1">
                  Supports PDF, Word (.docx), TXT, or .crystal
                </span>
              </label>
            ) : (
              <div className="space-y-1">
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Paste unformatted syllabus text here:&#10;&#10;UNIT I: Introduction to Machine Learning&#10;Types of Learning: Supervised, Unsupervised, Reinforcement&#10;Theory of Generalization: Generalization bound, VC Dimension&#10;Decision Trees, Neural Networks, Ensemble Learning"
                  className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-mono text-neutral-800 placeholder-neutral-400 outline-none focus:border-neutral-500 focus:bg-white resize-none transition-all leading-relaxed"
                />
              </div>
            )}

            {/* Error Message Notice */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{errorMessage}</p>
                  {!apiKey && (
                    <button
                      type="button"
                      onClick={() => setIsApiKeyModalOpen(true)}
                      className="text-xs font-medium text-red-800 underline cursor-pointer"
                    >
                      Configure your API key now
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 mt-4 border-t border-neutral-100 space-y-3">
            {/* Loading Progress Bar */}
            {isFormatting && (
              <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span className="font-medium truncate max-w-[200px]">
                    {elapsedSeconds > 18
                      ? "Finalizing syllabus topics..."
                      : elapsedSeconds > 8
                        ? "AI is structuring syllabus tree..."
                        : statusMessage || "Processing syllabus..."}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {elapsedSeconds}s
                  </span>
                </div>
                <div className="w-full bg-neutral-200/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isFormatting}
              onClick={() => handleImport(true)}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-medium tracking-tight shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-manrope disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isFormatting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>
                    {statusMessage || "Processing syllabus..."} ({elapsedSeconds}s)
                  </span>
                </>
              ) : (
                <>
                  <span>Format & Open in Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Offline fallback button if API key not set */}
            {!apiKey && (
              <button
                type="button"
                disabled={isFormatting}
                onClick={() => handleImport(false)}
                className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-[11px] font-normal transition-all cursor-pointer"
              >
                Or format offline without AI
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Recently Worked on Files */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-[26px] border border-black/15 shadow-xs p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-xl font-light text-neutral-900 tracking-tight">
                Recent Files
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Continue where you left off
              </p>
            </div>

            <span className="text-xs font-mono text-neutral-400">
              {syllabi.length} files
            </span>
          </div>

          {/* List of Recent Files */}
          <div className="flex-1 overflow-y-auto space-y-3 pt-4 pr-1">
            {syllabi.map((file) => (
              <RecentFileCard
                key={file.id}
                file={file}
                onOpen={handleOpenSyllabus}
                onDelete={handleDeleteSyllabus}
              />
            ))}

            {syllabi.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <BookOpen className="w-10 h-10 mb-2 stroke-1 text-neutral-300" />
                <p className="text-sm">No recent files yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reusable API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={(key) => setApiKey(key)}
      />
    </main>
  );
}
