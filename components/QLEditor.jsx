import { useState } from 'react'
const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
import 'react-quill/dist/quill.snow.css'

function QLEditor({ initialContent }) {
  return (
    <QuillNoSSRWrapper
      value={initialContent}
      onEditorStateChange={setEditorState}
      editorClassName="border p-4 min-h-screen"
    />
  )
}

export default QLEditor
