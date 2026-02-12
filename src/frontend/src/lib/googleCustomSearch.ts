export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface SearchResponse {
  results: SearchResult[];
  error?: string;
}

export async function searchGoogle(
  query: string,
  apiKey: string,
  cx: string
): Promise<SearchResponse> {
  if (!query.trim()) {
    return { results: [], error: 'Please enter a search query' };
  }

  if (!apiKey.trim() || !cx.trim()) {
    return { results: [], error: 'API key and Search Engine ID are required' };
  }

  try {
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('cx', cx);
    url.searchParams.set('q', query);
    url.searchParams.set('num', '5');

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 429) {
        return { results: [], error: 'Daily search quota exceeded. Try again tomorrow!' };
      }
      if (response.status === 400) {
        return { results: [], error: 'Invalid API key or Search Engine ID' };
      }
      if (response.status === 403) {
        return { results: [], error: 'API key is invalid or restricted' };
      }
      return { results: [], error: `Search failed (${response.status})` };
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return { results: [], error: 'No results found for your query' };
    }

    const results: SearchResult[] = data.items.map((item: any) => ({
      title: item.title || 'Untitled',
      link: item.link || '',
      snippet: item.snippet || '',
    }));

    return { results };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { results: [], error: 'Network error. Check your connection!' };
    }
    return { results: [], error: 'Something went wrong. Try again!' };
  }
}
