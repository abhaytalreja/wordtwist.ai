'use client'
import { useState } from 'react'
import MyEditor from '@/components/WYSIWYGEditor'

export default function Home() {
  const [apiKey, setApiKey] = useState(
    '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'
  )
  const [keywords, setKeywords] = useState('')
  const [content, setContent] = useState('')
  // const [serp, setSerp] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const response = await fetch('/api/openAi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey, keywords }),
    })

    const result = await response.json()
    setContent(result.data.choices[0].text.trim())
  }
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <form
        onSubmit={handleSubmit}
        className="my-8 flex flex-col w-full justify-center"
      >
        <label>
          API Key:
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-3/4 my-2 outline ml-4 outline-1 p-2 leading-7 text-sm text-gray-600"
          />
        </label>
        <label>
          Keywords:
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-3/4 my-2 outline ml-4 outline-1 p-2 leading-7 text-sm text-gray-600"
          />
        </label>
        <input
          type="submit"
          value="Submit"
          className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        />
      </form>

      {content && <MyEditor initialContent={content} />}
    </main>
  )
}
