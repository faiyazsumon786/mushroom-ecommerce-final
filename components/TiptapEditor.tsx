'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, Heading2, List, ListOrdered, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { useCallback } from 'react';

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
            const toastId = toast.loading('Uploading image...');
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await fetch('/api/upload/image', {
                    method: 'POST',
                    body: formData,
                });
                if (!res.ok) throw new Error('Upload failed');
                const { url } = await res.json();
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
                toast.success('Image inserted!', { id: toastId });
            } catch (error) {
                toast.error('Could not upload image.', { id: toastId });
            }
        }
    };
    input.click();
  }, [editor]);

  return (
    <div className="border rounded-t-md p-2 bg-gray-50 flex gap-1 flex-wrap">
      {/* FIX: Added type="button" to all buttons to prevent form submission */}
      <Button type="button" variant={editor.isActive('bold') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('italic') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('strike') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('bulletList') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Button>
      <Button type="button" variant={editor.isActive('orderedList') ? 'default' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Button>
      <Button type="button" variant='ghost' size="icon" onClick={addImage}><ImageIcon className="h-4 w-4" /></Button>
    </div>
  );
};

const TiptapEditor = ({ content, onChange }: { content: string, onChange: (richText: string) => void }) => {
  const editor = useEditor({
    extensions: [
        StarterKit, 
        Image.configure({
            inline: true,
            allowBase64: true,
        }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none p-4 border-x border-b rounded-b-md min-h-[300px] bg-white text-gray-900',
      },
    },
  });

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;