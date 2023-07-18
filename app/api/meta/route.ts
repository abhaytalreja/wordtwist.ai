import { NextResponse } from 'next/server'
import { htmlToText } from 'html-to-text'

export const runtime = 'edge'

function convertPlainTextToHtml(text) {
  // Split the text into lines
  const lines = text.split('\n')

  // Convert each line to HTML
  const htmlLines = lines.map((line) => {
    // If the line is empty, return an empty string
    if (!line.trim()) {
      return ''
    }

    // If the line starts with a '-', convert it to a list item
    if (line.startsWith('- ')) {
      return `<li>${line.slice(2)}</li>`
    }

    // If the line ends with a ':', convert it to a header
    if (line.endsWith(':')) {
      return `<h2>${line.slice(0, -1)}</h2>`
    }

    // If the line starts with 'h1', 'h2', etc., return it as is
    if (/^h[1-6]/.test(line)) {
      return line
    }

    // Otherwise, just wrap the line in a paragraph
    return `<p>${line}</p>`
  })

  // Join the HTML lines into a single string
  const html = htmlLines.join('\n')

  return html
}

/**
 * The weather (client) API route handler.
 *
 * @usage https://example.com/api/?location=Enterprise,AL
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/router-handlers
 */
export async function POST(request) {
  // Get query params from request.
  const { apiKey, keywords } = await request.json()

  const tokens = []

  // No apiKey? Bail...
  if (!apiKey) {
    return new NextResponse(JSON.stringify({ error: 'No API Key provided.' }), {
      status: 400,
      statusText: 'Bad Request',
    })
  }

  // No keywords? Bail...
  if (!keywords) {
    return new NextResponse(
      JSON.stringify({ error: 'No keywords provided.' }),
      {
        status: 400,
        statusText: 'Bad Request',
      }
    )
  }

  let titleHtml = ''
  try {
    //Getting title variation, meta description and Wordpress tags

    const titlePrompt = `Please generate three different blog titles (less than 55 characters), three different meta descriptions (less than 155 characters), three different permalink for the titles, and a list of comma separated tags for wordpress, for a blog post about "${keywords}" in the below format.\n\n1. Blog Title 1: \n2. Blog Title 2: \n3. Blog Title 3: \n\n1. Meta Description 1: \n2. Meta Description 2: \n3. Meta Description 3: \n\n1. Permalink 1: \n2. Permalink 2: \n3. Permalink 3: \n\nTags:`

    const titleDetails = await fetch(
      'https://api.openai.com/v1/engines/text-davinci-003/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          //   prompt: `I'm writing an article about "${keywords}". Can you help me create an outline for the article?`,
          prompt: titlePrompt,
          max_tokens: 500,
        }),
      }
    )

    // Issue with the geocode request? Bail...
    if (titleDetails.status !== 200) {
      return new NextResponse(
        JSON.stringify({
          error: `${titleDetails.text}`,
        }),
        {
          status: titleDetails.status,
        }
      )
    }

    const titleJson = await titleDetails.json()
    tokens.push(titleJson.usage)

    console.log('***** Title JSON ****', titleJson)

    titleHtml = await convertPlainTextToHtml(titleJson.choices[0].text)

    console.log('***** Title HTML ****', titleHtml)

    // Convert the section content to HTML
    //   const html = htmlToText(sectionContent, {
    //     wordwrap: false,
    //     ignoreHref: true,
    //     ignoreImage: true,
    //     unorderedListItemPrefix: '- ',
    //   })

    // Add the section content to the overall content
    return NextResponse.json({ titleHtml }, { status: 200 })
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ error: `${error}` }), {
      status: 500,
      statusText: 'Internal Server Error',
    })
  }
}
