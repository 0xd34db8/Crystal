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
  const [selectedTopicId, setSelectedTopicId] = useState<string>("unit-1-3-1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Load active syllabus and api key on client
  useEffect(() => {
    const list = getSavedSyllabi();
    const activeId = getActiveSyllabusId();
    const active =
      list.find((s) => s.id === activeId) || list[0] || initialSyllabusData;
    setSyllabus(active);
    setApiKey(getApiKey());
  }, []);

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
      const updated = { ...prev, fileName: name };
      saveSyllabus(updated);
      return updated;
    });
  };

  const handleDeleteTopic = (itemId: string) => {
    setSyllabus((prev) => {
      const updated = {
        ...prev,
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
        items: addItemToTree(prev.items, parentId, newItem),
      };
      saveSyllabus(updated);
      return updated;
    });
  };

  const handleExport = () => {
    exportSyllabusAsFile(syllabus);
  };

  return (
    <main className="h-screen w-full bg-[#F9F9F9] flex flex-col overflow-hidden font-manrope">
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
      <div className="flex-1 flex gap-5 px-6 py-3 overflow-hidden min-h-0">
        {/* Left Pane: Syllabus Tree Card */}
        <div className="w-80 md:w-96 lg:w-[380px] flex-shrink-0 bg-white rounded-[26px] border border-black/15 shadow-xs flex flex-col overflow-hidden">
          <SyllabusTree
            items={syllabus.items}
            selectedTopicId={selectedTopicId}
            onSelectTopic={(topic) => setSelectedTopicId(topic.id)}
            onToggleExpand={handleToggleExpand}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTopic={handleDeleteTopic}
            onAddTopic={handleAddTopic}
            onToggleNote={handleToggleNote}
            searchQuery={searchQuery}
          />
        </div>

        {/* Right Pane: Main Note Editor Card */}
        <div className="flex-1 bg-white rounded-[26px] border border-black/15 shadow-xs flex flex-col overflow-hidden">
          <NoteEditor
            selectedTopic={selectedTopic}
            onSaveNote={handleSaveNote}
            onUpdateStatus={handleUpdateStatus}
            onClose={() => setSelectedTopicId("")}
            courseTitle={syllabus.fileName}
          />
        </div>
      </div>

      {/* Bottom Bar: Status Chip (Percentage of blue/done topics with popup) */}
      <div className="px-8 py-3 flex items-center justify-between border-t border-black/5 bg-[#F9F9F9]">
        <StatusChip items={syllabus.items} />

        <div className="text-[11px] text-neutral-400 font-light select-none">
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
