import { useEffect, useState } from 'react';
import { fetchPredictionById } from '../../api/predictions';
import { fetchEvidenceGraph } from '../../api/evidence';

export const useEvidenceGraph = (id: string) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [graph, setGraph] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await fetchPredictionById(id);
        const g = await fetchEvidenceGraph(id);
        setPrediction(p);
        setGraph(g);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return { prediction, graph, loading };
};
