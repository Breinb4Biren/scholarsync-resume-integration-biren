// this is just through SerpAPI  to see and expect to get same data using cheerio(for reference)
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const { authorId } = req.body;

  if (!authorId) {
    return res.status(400).json({ error: 'Missing authorId (e.g., HI-I6C0AAAAJ)' });
  }

  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_scholar_author',
        author_id: authorId,
        hl: 'en',
        api_key: process.env.SERP_API_KEY, // to store in .env
      },
    });

    const data = response.data;

    if (!data || !data.author) {
      return res.status(404).json({ error: 'Scholar profile not found.' });
    }

    const profile = {
      name: data.author.name,
      affiliations: data.author.affiliations,
      interests: data.author.interests?.map(i => i.title) || [],
      citations: data.cited_by?.table?.[0]?.citations?.all || '0',
      publications: data.articles?.map(article => ({
        title: article.title,
        link: article.link,
        authors: article.authors,
        year: article.year,
        cited_by: article.cited_by?.value || 0,
      })) || [],
    };

    return res.status(200).json(profile);
  } catch (error) {
    console.error('🔥 SerpAPI fetch error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch scholar data.' });
  }
}
