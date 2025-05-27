import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import Blockquote from "@tiptap/extension-blockquote";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  onApply: (val: string) => void;
  onCancel: () => void;
}

const toolbarControls = [
  { cmd: 'bold', icon: <b>B</b>, label: 'Bold' },
  { cmd: 'italic', icon: <i>I</i>, label: 'Italic' },
  { cmd: 'underline', icon: <u>U</u>, label: 'Underline' },
  { cmd: 'strike', icon: <s>S</s>, label: 'Strike' },
  { cmd: 'code', icon: <code>{"</>"}</code>, label: 'Code' },
  { cmd: 'blockquote', icon: <span>❝</span>, label: 'Blockquote' },
  { cmd: 'h1', icon: <span style={{fontWeight:700}}>H1</span>, label: 'Heading 1' },
  { cmd: 'h2', icon: <span style={{fontWeight:700}}>H2</span>, label: 'Heading 2' },
  { cmd: 'ul', icon: <span>• List</span>, label: 'Bullet List' },
  { cmd: 'ol', icon: <span>1. List</span>, label: 'Ordered List' },
  { cmd: 'link', icon: <span>🔗</span>, label: 'Link' },
  { cmd: 'image', icon: <span>🖼️</span>, label: 'Image' },
  { cmd: 'undo', icon: <span>↺</span>, label: 'Undo' },
  { cmd: 'redo', icon: <span>↻</span>, label: 'Redo' },
];

export default function RichTextEditor({ value, onChange, onApply, onCancel }: RichTextEditorProps) {
  const [localValue, setLocalValue] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Code,
      Blockquote,
      Image,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Type or paste text...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setLocalValue(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert min-h-[120px] p-2 outline-none font-geist-mono',
        style: 'font-family: Geist Mono, monospace; background: none;'
      }
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Toolbar actions
  const handleToolbar = useCallback((cmd: string) => {
    if (!editor) return;
    switch (cmd) {
      case 'bold': editor.chain().focus().toggleBold().run(); break;
      case 'italic': editor.chain().focus().toggleItalic().run(); break;
      case 'underline': editor.chain().focus().toggleUnderline().run(); break;
      case 'strike': editor.chain().focus().toggleStrike().run(); break;
      case 'code': editor.chain().focus().toggleCode().run(); break;
      case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break;
      case 'h1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
      case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
      case 'ul': editor.chain().focus().toggleBulletList().run(); break;
      case 'ol': editor.chain().focus().toggleOrderedList().run(); break;
      case 'link': {
        const url = window.prompt('Enter URL');
        if (url) editor.chain().focus().setLink({ href: url }).run();
        break;
      }
      case 'image': {
        const url = window.prompt('Enter image URL');
        if (url) editor.chain().focus().setImage({ src: url }).run();
        break;
      }
      case 'undo': editor.chain().focus().undo().run(); break;
      case 'redo': editor.chain().focus().redo().run(); break;
      default: break;
    }
  }, [editor]);

  return (
    <div className="bg-white dark:bg-black border border-border rounded-lg shadow-lg p-4 flex flex-col gap-2" style={{ minWidth: 350, minHeight: 220 }}>
      <div className="flex flex-wrap gap-1 mb-2">
        {toolbarControls.map(({ cmd, icon, label }) => (
          <Button key={cmd} size="icon" variant="outline" type="button" title={label} onClick={() => handleToolbar(cmd)}>
            {icon}
          </Button>
        ))}
      </div>
      <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-black min-h-[120px]" style={{ fontFamily: 'Geist Mono, monospace' }}>
        <EditorContent editor={editor} />
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onApply(localValue)}>Apply</Button>
      </div>
    </div>
  );
}
