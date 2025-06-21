import axios from "axios";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');
  const page = url.searchParams.get('page') || '1';
  const per_page = url.searchParams.get('per_page') || '10';

  try {
    const res = await axios.get('https://api.balldontlie.io/v1/players', {
      params: { search, page, per_page },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.AUTHORIZATION || '',
      },
    });

    return new Response(JSON.stringify(res.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error : any) {
    return new Response(JSON.stringify({ error: "Failed to fetch players" }), {
      status: error?.status || 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
