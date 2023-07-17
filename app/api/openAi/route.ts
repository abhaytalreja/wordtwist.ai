import { NextResponse } from 'next/server'

export const runtime = 'edge'

const getOrganicData = async (keywords) => {
  const serpKey = '14a3a87f0996404fb4e92f637bfcc72a'
  const response = await fetch(
    `http://api.serpstack.com/search?access_key=${serpKey}&query=${keywords}`
  )
  const data = await response.json()

  console.log('***********', data)

  const results = data.organic_results.map((result) => ({
    title: result.title,
    url: result.url,
    snippet: result.snippet,
  }))

  console.log(results)
  return results
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
          prompt: `Please ignore all previous instructions. Using the MECE framework, please create a detailed long-form content outline for our English writers on the topic: "${keywords}". Also, provide a short and attention-grabbing title for the article and an estimate of the word count for each subheading. Include a list of semantically similar FAQs using the vector representation technique. Generate the output in html format. Please don't write the article, only the outline for writers.`,
          max_tokens: 500,
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

    // const serpResults = await getOrganicData(keywords)

    // const googleKEY = 'AIzaSyBUt4_L880M-MVASe2765mqUMuGDO18VPw'
    // const cx = 'AIzaSyBUt4_L880M-MVASe2765mqUMuGDO18VPw'

    // const googleSearch = await fetch(
    //   `https://www.googleapis.com/customsearch/v1?key=${googleKEY}&q=${keywords}`,
    //   {
    //     method: 'GET',
    //   }
    // )

    // // Issue with the geocode request? Bail...
    // if (googleSearch.status !== 200) {
    //   console.log(googleSearch.json())
    //   return new NextResponse(
    //     JSON.stringify({
    //       error: `Google Search Console failed...`,
    //     }),
    //     {
    //       status: googleSearch.status,
    //     }
    //   )
    // }

    // Parse the response.
    const data = await response.json()

    console.log(data)

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error(error)
    return new NextResponse(JSON.stringify({ error: `${error}` }), {
      status: 500,
      statusText: 'Internal Server Error',
    })
  }
}
