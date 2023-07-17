import { NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * The weather (client) API route handler.
 *
 * @usage https://example.com/api/?location=Enterprise,AL
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/router-handlers
 */
export async function POST(request) {
  // Get query params from request.
  const { apiKey, blogTitle, sectionTitle, listOfTopicsToCover } =
    await request.json()

  // No apiKey? Bail...
  if (!apiKey) {
    return new NextResponse(JSON.stringify({ error: 'No API Key provided.' }), {
      status: 400,
      statusText: 'Bad Request',
    })
  }

  // No apiKey? Bail...
  if (!blogTitle) {
    return new NextResponse(
      JSON.stringify({ error: 'No blog Title provided.' }),
      {
        status: 400,
        statusText: 'Bad Request',
      }
    )
  }

  // No keywords? Bail...
  if (!sectionTitle) {
    return new NextResponse(
      JSON.stringify({ error: 'No keywords provided.' }),
      {
        status: 400,
        statusText: 'Bad Request',
      }
    )
  }

  // No listOfTopicsToCover? Bail...
  if (!listOfTopicsToCover) {
    return new NextResponse(
      JSON.stringify({ error: 'No list of topics provided.' }),
      {
        status: 400,
        statusText: 'Bad Request',
      }
    )
  }

  // const topicsToCover =

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
          prompt: `Write a section for ${sectionTitle} for a blog article titled ${blogTitle}. The section should cover the following points:\n\n- What is bamboo charcoal?\n- Three core benefits of using bamboo charcoal`,
          max_tokens: 200,
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
