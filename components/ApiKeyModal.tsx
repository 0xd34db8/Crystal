"use client";

import React, { useState, useEffect } from "react";
import {
  getAIConfig,
  saveAIConfig,
  removeApiKey,
  LLMProvider,
  getDefaultModelForProvider,
  detectProviderFromKey,
} from "@/lib/storage";
import { testUniversalApiKey } from "@/lib/ai";
import {
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (newKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [provider, setProvider] = useState<LLMProvider>("gemini");
  const [inputKey, setInputKey] = useState<string>("");
  const [model, setModel] = useState<string>("gemini-3.8-flash");
  const [baseURL, setBaseURL] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const config = getAIConfig();
      setProvider(config.provider || "gemini");
      setInputKey(config.apiKey || "");
      setModel(config.model || getDefaultModelForProvider(config.provider || "gemini"));
      setBaseURL(config.baseURL || "");
      setShowAdvanced(config.provider === "custom" || Boolean(config.baseURL));
      setTestResult(null);
      setSavedFeedback(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    setModel(getDefaultModelForProvider(newProvider));
    if (newProvider === "custom") {
      setShowAdvanced(true);
    }
    setTestResult(null);
  };

  const handleKeyChange = (value: string) => {
    setInputKey(value);
    setTestResult(null);

    // Auto-detect provider if user pastes a recognizable key
    const detected = detectProviderFromKey(value);
    if (detected !== provider && value.trim().length > 8) {
      setProvider(detected);
      setModel(getDefaultModelForProvider(detected));
    }
  };

  const handleTestKey = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setTestResult({
        success: false,
        message: "Please enter an API key first.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testUniversalApiKey({
        provider,
        apiKey: trimmed,
        model: model.trim() || getDefaultModelForProvider(provider),
        baseURL: baseURL.trim() || undefined,
      });

      if (result.valid) {
        setTestResult({
          success: true,
          message: "Connection verified.",
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Validation failed.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to reach API endpoint.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = inputKey.trim();
    saveAIConfig({
      provider,
      apiKey: trimmed,
      model: model.trim() || getDefaultModelForProvider(provider),
      baseURL: baseURL.trim() || undefined,
    });

    onKeyUpdated?.(trimmed);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 500);
  };

  const handleRemove = () => {
    removeApiKey();
    setInputKey("");
    setTestResult(null);
    onKeyUpdated?.("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-neutral-300 dark:border-neutral-700 shadow-2xl w-full max-w-md p-6 space-y-4 font-manrope animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                API Key settings
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#252528] border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-100 outline-none focus:border-neutral-500 font-manrope cursor-pointer"
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic Claude</option>
            <option value="openrouter">OpenRouter</option>
            <option value="groq">Groq</option>
            <option value="custom">Custom / OpenAI Compatible</option>
          </select>
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            API Key
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              value={inputKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="Paste your API key"
              className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 dark:bg-[#252528] border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-500 focus:bg-white dark:focus:bg-[#2A2A2D] font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 p-1 cursor-pointer"
              title={showPassword ? "Hide key" : "Show key"}
            >
              {showPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
          >
            {showAdvanced ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            <span>Advanced (Model & Endpoint)</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-3 pt-1 border-t border-neutral-100 dark:border-neutral-800">
            {/* Model Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Model Name
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={getDefaultModelForProvider(provider)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#252528] border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-100 outline-none focus:border-neutral-500 font-mono"
              />
            </div>

            {/* Custom Base URL (if custom or openrouter or overridden) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Base URL (optional)
              </label>
              <input
                type="text"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder={
                  provider === "custom"
                    ? "http://localhost:11434/v1"
                    : "Default provider endpoint"
                }
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#252528] border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-800 dark:text-neutral-100 outline-none focus:border-neutral-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* Test Connection Button & Result */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={isTesting || !inputKey.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-neutral-600 dark:text-neutral-400" />
                <span>Testing...</span>
              </>
            ) : (
              <span>Test API Key</span>
            )}
          </button>

          {testResult && (
            <div
              className={`flex items-center gap-1.5 text-[11px] font-medium ${
                testResult.success
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {testResult.success ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              )}
              <span className="truncate max-w-[220px]">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Success Feedback */}
        {savedFeedback && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Saved</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {inputKey ? (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium cursor-pointer"
            >
              Remove
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-medium text-white dark:text-neutral-950 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 rounded-full transition-all shadow-xs cursor-pointer"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
