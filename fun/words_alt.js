const url = "words.txt";

fetch(url)
  .then(res => res.text())
  .then(text => {
    // Split by newline and remove any empty strings
    const DICTIONARY = text.split('\n').filter(word => word.trim().toUpperCase() !== "");
  });

export DICTIONARY;