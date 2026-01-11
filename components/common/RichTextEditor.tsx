
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const MODULES = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean']
  ],
};

const FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, height = '200px' }) => {

  return (
    <div className="rich-text-editor-wrapper bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={MODULES}
        formats={FORMATS}
        placeholder={placeholder}
        style={{ height }}
        className="dark:text-white"
      />
      <style>{`
        .ql-toolbar.ql-snow {
          border-color: transparent;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark .ql-toolbar.ql-snow {
          border-bottom-color: #4b5563;
        }
        .ql-container.ql-snow {
          border: none;
        }
        .dark .ql-stroke {
          stroke: #e5e7eb !important;
        }
        .dark .ql-fill {
          fill: #e5e7eb !important;
        }
        .dark .ql-picker {
          color: #e5e7eb !important;
        }
        .dark .ql-picker-options {
          background-color: #1f2937 !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
