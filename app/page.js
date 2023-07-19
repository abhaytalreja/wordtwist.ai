'use client'
import { useState } from 'react'
import MyEditor from '../components/QLEditor'

export default function Home() {
  const [apiKey, setApiKey] = useState(
    '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'
  )
  const [keywords, setKeywords] = useState('Bamboo Charcoal')
  const [content, setContent] = useState('')
  const [metaRecommendation, setMetaRecommendation] = useState('')
  const [totalTokensUsed, setTotalTokensUsed] = useState('')

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
    // setContent(result.data.choices[0].text.trim())
    setContent(result.content)
    setTotalTokensUsed(result.totalTokensUsed)

    const titleResponse = await fetch('/api/meta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey, keywords }),
    })
    setMetaRecommendation(titleResponse.titleHtml)
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
      <div className="text-right w-full font-black">{totalTokensUsed}</div>

      <div
        className="m-4 p-4 border rounded-lg"
        dangerouslySetInnerHTML={{ __html: metaRecommendation }}
      ></div>
      {content && <MyEditor initialContent={content} />}
    </main>
  )
}
