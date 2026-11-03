"use client";

import React, { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { SyllabusTree } from "@/components/SyllabusTree";
import { NoteEditor } from "@/components/NoteEditor";
import { StatusChip } from "@/components/StatusChip";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { initialSyllabusData } from "@/lib/mockData";
import {
  getSavedSyllabi,
  saveSyllabus,
  getActiveSyllabusId,
  getApiKey,
  cleanupUnusedDrafts,
} from "@/lib/storage";
import {
  findItemById,
  updateItemInTree,
  deleteItemFromTree,
  addItemToTree,
  exportSyllabusAsFile,
} from "@/lib/syllabusUtils";
import {
  SyllabusData,
  SyllabusItem,
  TopicNote,
  TopicStatus,
} from "@/types/syllabus";

export default function EditPage() {
  const [syllabus, setSyllabus] = useState<SyllabusData>(initialSyllabusData);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"tree" | "editor">("tree");

  // Load active syllabus and api key on client
  useEffect(() => {
    const list = getSavedSyllabi(true);
    const activeId = getActiveSyllabusId();
    const active =
      (activeId ? list.find((s) => s.id === activeId) : null) ||
      list[0] ||
      initialSyllabusData;
    setSyllabus(active);
    if (active.items && active.items.length > 0) {
      setSelectedTopicId(active.items[0].id);
    }
    setApiKey(getApiKey());

    return () => {
      // Clean up any empty drafts if leaving without changes
      cleanupUnusedDrafts();
    };
  }, []);

  // Ctrl + S (or Cmd + S) prompts to save / export as .crystal, not .html
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        exportSyllabusAsFile(syllabus);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [syllabus]);

  const selectedTopic = findItemById(syllabus.items, selectedTopicId);

  // Toggle item expanded state
  const handleToggleExpand = (itemId: string) => {
    setSyllabus((prev) => {
      const updated = {
        ...prev,
        items: updateItemInTree(prev.items, itemId, (item) => ({
          ...item,
          isExpanded: !item.isExpanded,
        })),
      };
      saveSyllabus(updated);
      return updated;
    });
  };

  // Update item progress status (done, partial, barely, untouched)
  const handleUpdateStatus = (itemId: string, status: TopicStatus) => {
    setSyllabus((prev) => {
      const updated = {
        ...prev,
        isDraft: false,
        items: updateItemInTree(prev.items, itemId, (item) => ({
          ...item,
          status,
        })),
      };
      saveSyllabus(updated);
      return updated;
    });
  };

  // Save note for topic
  const handleSaveNote = (topicId: string, note: TopicNote) => {
    setSyllabus((prev) => {
      const updated = {
        ...prev,
        isDraft: false,
        items: updateItemInTree(prev.items, topicId, (item) => ({
          ...item,
          hasNote: true,
          note,
        })),
      };
      saveSyllabus(updated);
      return updated;
    });
  };

  // Toggle note existence
  const handleToggleNote = (itemId: string) => {
    setSyllabus((prev) => {
      const updated = {
        ...prev,
        isDraft: false,
        items: updateItemInTree(prev.items, itemId, (item) => {
          const hasNote = !item.hasNote;
          return {
            ...item,
            hasNote,
            note: hasNote
              ? {
                  id: `note-${item.id}`,
                  title: item.title,
                  content: `### ${item.title}\n\nStart writing notes here...`,
                  updatedAt: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                }
              : undefined,
          };
        }),
      };
      saveSyllabus(updated);
      return updated;
    });
  };

  const handleFileNameChange = (name: string) => {
    setSyllabus((prev) => {
      const updated = { ...prev, isDraft: false, fileName: name };
      saveSyllabus(updated);
      return updated;
    });
  };

  const handleDeleteTopic = (itemId: string) => {
    setSyllabus((prev) => {
      const updated = {
        ...prev,
        isDraft: false,
        items: deleteItemFromTree(prev.items, itemId),
      };
      saveSyllabus(updated);
      return updated;
    });
    if (selectedTopicId === itemId) {
      setSelectedTopicId("");
    }
  };

  const handleAddTopic = (parentId: string | null, title: string) => {
    const newItem: SyllabusItem = {
      id: `topic-${Date.now()}`,
      title: title.trim(),
      status: "untouched",
      hasNote: false,
    };
    setSyllabus((prev) => {
      const updated = {
        ...prev,
        isDraft: false,
        items: addItemToTree(prev.items, parentId, newItem),
      };
      saveSyllabus(updated);
      return updated;
    });
  };

  const handleRenameTopic = (itemId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setSyllabus((prev) => {
      const updated = {
        ...prev,
        isDraft: false,
        items: updateItemInTree(prev.items, itemId, (item) => ({
          ...item,
          title: trimmed,
          note: item.note ? { ...item.note, title: trimmed } : undefined,
        })),
      };
      saveSyllabus(updated);
      return updated;
    });
  };

  const handleExport = () => {
    exportSyllabusAsFile(syllabus);
  };

  const handleUpdateItems = (newItems: SyllabusItem[]) => {
    setSyllabus((prev) => {
      const updated = {
        ...prev,
        isDraft: false,
        items: newItems,
      };
      saveSyllabus(updated);
      return updated;
    });
  };

  return (
    <main className="h-screen w-full bg-[#F9F9F9] dark:bg-[#121212] flex flex-col overflow-hidden font-manrope">
      {/* Top Header Bar */}
      <TopBar
        fileName={syllabus.fileName}
        onFileNameChange={handleFileNameChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={handleExport}
        onApiKeyClick={() => setIsApiKeyModalOpen(true)}
        apiKeyConfigured={Boolean(apiKey)}
      />

      {/* Content Area with Split Panes taking full screen */}
      <div className="flex-1 flex gap-3 md:gap-5 px-3 sm:px-4 md:px-6 py-2 md:py-3 overflow-hidden min-h-0">
        {/* Left Pane: Syllabus Tree Card */}
        <div
          className={`w-full md:w-80 lg:w-96 xl:w-[380px] flex-shrink-0 bg-white dark:bg-[#1C1C1E] rounded-2xl md:rounded-[26px] border border-black/15 dark:border-white/10 shadow-xs flex flex-col overflow-hidden ${
            mobileTab === "tree" ? "flex" : "hidden md:flex"
          }`}
        >
          <SyllabusTree
            items={syllabus.items}
            selectedTopicId={selectedTopicId}
            onSelectTopic={(topic) => {
              setSelectedTopicId(topic.id);
              setMobileTab("editor");
            }}
            onToggleExpand={handleToggleExpand}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTopic={handleDeleteTopic}
            onAddTopic={handleAddTopic}
            onRenameTopic={handleRenameTopic}
            onToggleNote={handleToggleNote}
            onUpdateItems={handleUpdateItems}
            searchQuery={searchQuery}
          />
        </div>

        {/* Right Pane: Main Note Editor Card */}
        <div
          className={`flex-1 bg-white dark:bg-[#1C1C1E] rounded-2xl md:rounded-[26px] border border-black/15 dark:border-white/10 shadow-xs flex flex-col overflow-hidden ${
            mobileTab === "editor" ? "flex" : "hidden md:flex"
          }`}
        >
          <NoteEditor
            selectedTopic={selectedTopic}
            onSaveNote={handleSaveNote}
            onUpdateStatus={handleUpdateStatus}
            onClose={() => {
              setSelectedTopicId("");
              setMobileTab("tree");
            }}
            courseTitle={syllabus.fileName}
            onRenameTopic={handleRenameTopic}
            onBackToTree={() => setMobileTab("tree")}
          />
        </div>
      </div>

      {/* Bottom Bar: Status Chip (Percentage of blue/done topics with popup) */}
      <div className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 flex items-center justify-between border-t border-black/5 dark:border-neutral-800 bg-[#F9F9F9] dark:bg-[#121212] gap-2">
        <StatusChip items={syllabus.items} />

        {/* Mobile View Switcher between Syllabus Tree and Note Editor */}
        <div className="flex md:hidden items-center p-0.5 bg-neutral-200/90 dark:bg-neutral-800 rounded-full text-xs font-medium shadow-xs">
          <button
            type="button"
            onClick={() => setMobileTab("tree")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              mobileTab === "tree"
                ? "bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            Tree
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              mobileTab === "editor"
                ? "bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            Note
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 dark:text-neutral-600 font-light select-none hidden xs:block">
          Crystal
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={(key) => setApiKey(key)}
      />
    </main>
  );
}
