require("dotenv").config();
async function getNews() {
  try {
    const url = `https://api.currentsapi.services/v1/latest-news?apiKey=${process.env.CURRENTNEWS_API}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Http Error : ${response.status}`);
    }

    const data = await response.json();

    return data.news;
  } catch (err) {
    console.log(err);
  }
}
module.exports = getNews;
