'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { useCallback } from 'react';

// Toolbar Component
const Toolbar = ({ editor }: { editor: Editor | null }) => {
  const addImage = useCallback(() => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const toastId = toast.loading('Uploading image...');
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await fetch('/api/upload/image', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const { url } = await res.json();
        if (url) editor.chain().focus().setImage({ src: url }).run();
        toast.success('Image inserted!', { id: toastId });
      } catch (error) {
        toast.error('Could not upload image.', { id: toastId });
      }
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-2 rounded-t-md">
      <Button type="button" variant={editor.isActive('bold') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('italic') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('strike') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('bulletList') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('orderedList') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={addImage}><ImageIcon className="h-4 w-4" /></Button>
    </div>
  );
};

// Tiptap Editor Component
const TiptapEditor = ({ content, onChange }: { content: string; onChange: (richText: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'rounded-lg shadow-md my-4 w-full' },
      }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        className: 'prose prose-sm sm:prose-base lg:prose-lg focus:outline-none p-6 bg-white rounded-b-md min-h-[400px] w-full mx-auto',
      },
    },
    immediatelyRender: false, // SSR safe
  });

  return (
    <div className="w-full max-w-4xl mx-auto border rounded-md shadow-sm">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
