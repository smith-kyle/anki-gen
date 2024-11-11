import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [word, setWord] = useState("");
  const [definitions, setDefinitions] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRandomWord = async () => {
    try {
      const response = await fetch(
        "https://random-word-api.herokuapp.com/word"
      );
      const [randomWord] = await response.json();
      return randomWord;
    } catch (error) {
      console.error("Error fetching random word:", error);
      return "example"; // fallback word
    }
  };

  const fetchDefinitions = async (word) => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      const data = await response.json();
      return data[0].meanings;
    } catch (error) {
      console.error("Error fetching definitions:", error);
      return [];
    }
  };

  const fetchImage = async (searchTerm) => {
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${randomId}/400/300`;
  };

  const loadNewWord = async () => {
    setLoading(true);
    const newWord = await fetchRandomWord();
    setWord(newWord);

    const newDefinitions = await fetchDefinitions(newWord);
    setDefinitions(newDefinitions);

    const newImage = await fetchImage(newWord);
    setImage(newImage);
    setLoading(false);
  };

  const loadNewImage = async () => {
    const newImage = await fetchImage(word);
    setImage(newImage);
  };

  const formatDefinitionsForAnki = (definitions) => {
    const formattedDefinitions = definitions
      .map((meaning) => {
        const defs = meaning.definitions
          .map((def) => def.definition)
          .join("<br>• ");
        return `<strong>${meaning.partOfSpeech}</strong><br>• ${defs}`;
      })
      .join("<br><br>");
    const wordHeading = `<h1>${word}</h1><br>`;
    return wordHeading + formattedDefinitions;
  };

  const getAnkiLink = () => {
    const imageTag = `<img src="${image}" alt="${word}">`;
    const encodedImage = encodeURIComponent(imageTag);
    const encodedDefinitions = encodeURIComponent(
      formatDefinitionsForAnki(definitions)
    );

    return `anki://x-callback-url/addnote?profile=User%201&type=Basic&deck=Vocab&fldFront=${encodedImage}&fldBack=${encodedDefinitions}`;
  };

  useEffect(() => {
    loadNewWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <div className="word-container">
        <h1>{word}</h1>
        <button onClick={loadNewWord}>Generate New Word</button>
        <div className="image-container">
          {image && <img src={image} alt={word} />}
          <button onClick={loadNewImage}>New Image</button>
          <a href={getAnkiLink()} className="anki-link">
            Add to Anki
          </a>
        </div>
        <div className="definitions">
          {definitions.map((meaning, index) => (
            <div key={index} className="meaning">
              <h3>{meaning.partOfSpeech}</h3>
              <ul>
                {meaning.definitions.map((def, i) => (
                  <li key={i}>{def.definition}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
