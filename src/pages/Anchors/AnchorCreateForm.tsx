import { useState } from 'react';
import { createAnchor } from '../../api/anchors';

const AnchorCreateForm = ({ onCreate }: { onCreate: () => void }) => {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('general');

  const submit = async () => {
    if (!word.trim()) return;
    await createAnchor({ word, category });
    setWord('');
    onCreate();
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        placeholder="Anchor word"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ marginRight: 8 }}>
        <option value="general">General</option>
        <option value="economic">Economic</option>
        <option value="medical">Medical</option>
        <option value="legal">Legal</option>
      </select>
      <button onClick={submit}>Add Anchor</button>
    </div>
  );
};

export default AnchorCreateForm;
