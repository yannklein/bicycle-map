const getInstaHighlights = async (storyId) => {
  const url =
    'https://rocketapi-for-instagram.p.rapidapi.com/instagram/highlight/get_stories';
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': '9680a5ecf0msh9b27fc604f476ddp1b4f9ejsnf75bb930c270',
      'x-rapidapi-host': 'rocketapi-for-instagram.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ids: [storyId],
    }),
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export default getInstaHighlights;
