import { useState } from 'react'
import { EditorState, ContentState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

function MyEditor({ initialContent }) {
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(ContentState.createFromText(initialContent))
  )

  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={setEditorState}
      editorClassName="border p-4 min-h-screen"
    />
  )
}

export default MyEditor
