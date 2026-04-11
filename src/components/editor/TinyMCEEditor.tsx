"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditorType } from "tinymce";

// TinyMCE 自托管模式：手动导入核心模块
import "tinymce";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/models/dom";
// 注意：不直接 import CSS 文件，因为 PostCSS/Turbopack 无法解析 TinyMCE CSS 中的
// :nth-child(2 of ...) 等较新 CSS 语法。皮肤样式通过 skin_url 配置从 CDN 加载。

// 导入所需插件（仅基础功能）
import "tinymce/plugins/link";
import "tinymce/plugins/lists";

interface TinyMCEEditorProps {
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
 * 将图片文件通过 FormData POST 到 /api/upload
 * 返回图片 URL
 */
const uploadImage = async (file: File): Promise<string> => {
  const token = localStorage.getItem("admin_token");
  if (!token) throw new Error("未登录，无法上传图片");

  const formData = new FormData();
  formData.append("file", file);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/upload");
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);

  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`上传失败: HTTP ${xhr.status}`));
        return;
      }
      try {
        const json = JSON.parse(xhr.responseText);
        if (json.code === 0 && json.data?.url) {
          resolve(json.data.url);
        } else {
          reject(new Error(json.message || "上传失败"));
        }
      } catch {
        reject(new Error("解析上传响应失败"));
      }
    };
    xhr.onerror = () => reject(new Error("网络错误，上传失败"));
    xhr.send(formData);
  });
};

/**
 * TinyMCE 富文本编辑器组件
 * 自托管模式，无需 API key
 * 支持一键上传图片、粘贴图片、拖拽图片
 */
const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  value,
  onChange,
  placeholder = "请输入文章正文...",
  height = 500,
}) => {
  const editorRef = useRef<TinyMCEEditorType | null>(null);

  const handleInit = (_evt: unknown, editor: TinyMCEEditorType) => {
    editorRef.current = editor;

    // 注册自定义"上传图片"按钮：点击直接弹出文件选择器
    editor.ui.registry.addButton("uploadimage", {
      text: "图片",
      icon: "image",
      onAction: () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            const url = await uploadImage(file);
            editor.insertContent(`<img src="${url}" alt="" style="max-width:100%;height:auto;" />`);
          } catch (e) {
            const msg = e instanceof Error ? e.message : "图片上传失败";
            editor.notificationManager.open({ text: msg, type: "error" });
          }
        };
        input.click();
      },
    });
  };

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  // 皮肤和内容样式 CDN 路径
  const skinUrl = "https://cdn.jsdelivr.net/npm/tinymce@7/skins/ui/oxide";
  const contentUrl = "https://cdn.jsdelivr.net/npm/tinymce@7/skins/content/default";

  return (
    <Editor
      licenseKey="gpl"
      initialValue={value}
      onInit={handleInit}
      onEditorChange={handleEditorChange}
      init={{
        height,
        placeholder,
        menubar: false,
        skin_url: skinUrl,
        content_css: `${contentUrl}/content.min.css`,
        // 工具栏：基础格式化 + 自定义图片上传按钮
        toolbar: "undo redo | bold italic underline | forecolor | bullist numlist | alignleft aligncenter alignright | link uploadimage | removeformat",
        // 仅加载链接和列表插件
        plugins: ["link", "lists"],
        // 粘贴/拖拽图片自动上传
        images_upload_handler: async (blobInfo) => {
          const file = new File(
            [blobInfo.blob()],
            blobInfo.filename() || `image-${Date.now()}.png`,
            { type: blobInfo.blob().type }
          );
          return uploadImage(file);
        },
        // 允许粘贴图片和拖拽图片自动上传
        automatic_uploads: true,
        browser_spellcheck: true,
        relative_urls: false,
        remove_script_host: true,
        convert_urls: true,
        branding: false,
        promotion: false,
        statusbar: false,
        elementpath: false,
        content_style: `
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; }
          img { max-width: 100%; height: auto; }
        `,
      }}
    />
  );
};

export default TinyMCEEditor;
