"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import { useEffect, useCallback, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react";

// TipTap 没有内置的下划线扩展，用 mark 手动实现
import { Mark, markInputRule, markPasteRule } from "@tiptap/core";

const UnderlineMark = Mark.create({
  name: "underline",
  parseHTML() { return [{ tag: "u" }, { style: "text-decoration", consuming: false, getAttrs: (style) => (style as string).includes("underline") ? {} : false }]; },
  renderHTML() { return ["u", 0]; },
  addInputRules() { return [markInputRule({ find: /(?:^|\s)(~([^~]+)~)$/, type: this.type })]; },
  addKeyboardShortcuts() { return { "Mod-u": () => this.editor.commands.toggleMark(this.name) }; },
});

interface TipTapEditorProps {
  /** 编辑器内容（HTML 字符串） */
  value: string;
  /** 内容变化回调 */
  onChange: (value: string) => void;
  /** 占位文本 */
  placeholder?: string;
  /** 编辑器高度（px） */
  height?: number;
}

/**
 * 上传图片到服务器
 */
const uploadImage = async (file: File): Promise<string> => {
  const token = localStorage.getItem("admin_token");
  if (!token) throw new Error("未登录，无法上传图片");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (data.code === 0 && data.data?.url) return data.data.url;
  throw new Error(data.message || "上传失败");
};

/**
 * TipTap 富文本编辑器组件
 * 轻量级，无外部依赖，支持图片上传
 */
const TipTapEditor: React.FC<TipTapEditorProps> = ({
  value,
  onChange,
  placeholder = "请输入文章正文...",
  height = 500,
}) => {
  // 用 ref 防止外部 value 更新时触发 onChange 回调
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineMark,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank" } }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
    ],
    content: value,
    editorProps: {
      // 粘贴图片自动上传
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      // 拖拽图片自动上传
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        for (const file of Array.from(files)) {
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
    },
  });

  // 外部 value 变化时同步（如加载文章）
  useEffect(() => {
    if (editor && !isInternalUpdate.current) {
      editor.commands.setContent(value || "");
    }
    isInternalUpdate.current = false;
  }, [value, editor]);

  // 图片上传处理
  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      // 上传失败静默处理
    }
  }, [editor]);

  // 插入链接
  const handleAddLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("请输入链接地址:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  // 选择文件上传图片
  const handleFileUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) await handleImageUpload(file);
    };
    input.click();
  }, [handleImageUpload]);

  if (!editor) return null;

  // 工具栏按钮配置
  const toolbarButtons = [
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false, title: "撤销" },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false, title: "重做" },
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "加粗" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "斜体" },
    { icon: Underline, action: () => editor.chain().focus().toggleMark("underline").run(), active: editor.isActive("underline"), title: "下划线" },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "无序列表" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), title: "有序列表" },
    { icon: LinkIcon, action: handleAddLink, active: editor.isActive("link"), title: "链接" },
    { icon: ImageIcon, action: handleFileUpload, active: false, title: "上传图片" },
    { icon: RemoveFormatting, action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(), active: false, title: "清除格式" },
  ];

  return (
    <div className="tiptap-editor border rounded-md overflow-hidden">
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b bg-muted/30">
        {toolbarButtons.map((btn, i) => (
          <button
            key={i}
            type="button"
            title={btn.title}
            onClick={btn.action}
            className={`p-1.5 rounded hover:bg-muted transition-colors ${
              btn.active ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
          >
            <btn.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* 编辑区域 */}
      <EditorContent
        editor={editor}
        style={{ minHeight: height }}
        className="tiptap-content p-3"
      />
    </div>
  );
};

export default TipTapEditor;
