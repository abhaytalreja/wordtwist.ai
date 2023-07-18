import { NextResponse } from 'next/server'
import { htmlToText } from 'html-to-text'

export const runtime = 'edge'

function convertPlainTextToHtml(text) {
  const lines = text.split('\n')

  const htmlLines = lines.map((line) => {
    if (!line.trim()) {
      return ''
    }

    if (line.startsWith('- ')) {
      return `<li>${line.slice(2)}</li>`
    }

    if (line.endsWith(':')) {
      return `<h2>${line.slice(0, -1)}</h2>`
    }

    if (/^h[1-6]/.test(line)) {
      const headerLevel = line[1]
      const headerText = line.slice(3)
      return `<h${headerLevel}>${headerText}</h${headerLevel}>`
    }

    if (/^<h[1-6]/.test(line)) {
      return line
    }

    return `<p>${line}</p>`
  })

  return htmlLines.join('\n')
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

  try {
    const response = await fetch(
      'https://api.openai.com/v1/engines/text-davinci-003/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          //   prompt: `I'm writing an article about "${keywords}". Can you help me create an outline for the article?`,
          prompt: `Please ignore all previous instructions. Using the MECE framework, please create a detailed long-form content, outline for our English writers on the topic: "${keywords}". Also, provide a short attention-grabbing title (150 characters) as an h1 tag, for the article. Please only generate the outline of the article and do not write the article. DO NOT NUMBER the headers and subheaders in any way. Include a list of semantically similar FAQs using the vector representation technique as a list at the end.`,
          max_tokens: 800,
        }),
      }
    )

    // Issue with the geocode request? Bail...
    if (response.status !== 200) {
      return new NextResponse(
        JSON.stringify({
          error: `${response.text}`,
        }),
        {
          status: response.status,
        }
      )
    }

    // Parse the response.
    const data = await response.json()
    tokens.push(data.usage)

    console.log(data)

    // Parse the outline to get the sections and their corresponding points
    const sections = data.choices[0].text.split('\n\n').map((section) => {
      const [title, ...points] = section.split('\n')
      return { title, points }
    })

    let content = ''
    let titleHtml = ''

    console.log('***** Got outline ********')

    // For each section, create a prompt and send a request to the OpenAI API to generate the content for that section
    for (const { title, points } of sections) {
      // Skip if the title or points are empty
      if (!title.trim() || !points.some((point) => point.trim())) {
        continue
      }

      const prompt = `Write a section for a blog article titled '${title}'. When you write the content, keep the paragraphs to a maximum of 3 sentences. Please use an active voice for writing. Keep the english level for an 8th grader. The section should cover the following points:\n\n${points.join(
        '\n'
      )} \n\nWrite at least 3 paragraphs per subtopic. Write in a casual, informal style. Generate the output in html syntax with header and sub-headers. Include a creative or thought-provoking subtitle for each section, but do not number the sections in any way. Include a lot of detail. If the section can be writen as a numbered list, please do that. \n\nAfter writing the section and not sub-sections, suggest a description for an image that perfectly represents the content of the section. The idea is to create midjourney prompt with this description. Please wrap the prompt in [] brackets. Append the below to every midjourney prompt --ar 5:3 --quality 0.75`

      console.log(`***** Processing Section - ${title} ********`)

      const response = await fetch(
        'https://api.openai.com/v1/engines/text-davinci-003/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            prompt,
            max_tokens: 1000,
          }),
        }
      )

      const sectionData = await response.json()
      tokens.push(sectionData.usage)
      const sectionContent = sectionData.choices[0].text.trim()

      const html = convertPlainTextToHtml(sectionContent)

      // Convert the section content to HTML
      //   const html = htmlToText(sectionContent, {
      //     wordwrap: false,
      //     ignoreHref: true,
      //     ignoreImage: true,
      //     unorderedListItemPrefix: '- ',
      //   })

      // Add the section content to the overall content
      content += `\n\n<h2>${title}</h2>\n${html}\n`
    }

    console.log(content)

    console.log(tokens)

    const totalTokensUsed = tokens.reduce(
      (total, token) => total + token.total_tokens,
      0
    )

    return NextResponse.json({ content, totalTokensUsed }, { status: 200 })
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ error: `${error}` }), {
      status: 500,
      statusText: 'Internal Server Error',
    })
  }
}
