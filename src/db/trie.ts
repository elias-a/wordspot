export class DictionaryTrie {
  root: DictionaryTrieNode;

  constructor() {
    this.root = new DictionaryTrieNode();
  }

  insert(word: string) {
    let pointer = this.root;

    for (let i = 0; i < word.length; i++) {
      const letterIndex = word[i].charCodeAt(0) - "a".charCodeAt(0);
      
      if (pointer.children[letterIndex] === null) {
        pointer.children[letterIndex] = new DictionaryTrieNode();
      }

      pointer = pointer.children[letterIndex];
    }

    pointer.isEndOfWord = true;
  }

  build(words: string[]) {
    for (let i = 0; i < words.length; i++) {
      this.insert(words[i]);
    }
  }

  search(word: string) {
    let pointer = this.root;

    for (let i = 0; i < word.length; i++) {
      const letterIndex = word[i].charCodeAt(0) - "a".charCodeAt(0);
      
      if (pointer.children[letterIndex] === null) {
        return false;
      }

      pointer = pointer.children[letterIndex];
    }

    return pointer.isEndOfWord;
  }
}

class DictionaryTrieNode {
  isEndOfWord: boolean;
  children: DictionaryTrieNode[];

  constructor() {
    this.isEndOfWord = false;
    this.children = new Array(26).fill(null);
  }
}
