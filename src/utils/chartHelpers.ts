import type { Prediction } from '../api/predictions';

interface AnchorData {
  word: string;
  count?: number;
}

export const mapPredictionsToLineSeries = (preds: Prediction[]): Array<{ date: string; score: number; risk: number }> =>
  preds.map((p) => {
    // Handle both timestamp and created_at fields, and ensure it's a string
    const dateStr = p.timestamp || p.created_at || new Date().toISOString();
    const date = typeof dateStr === 'string' ? dateStr.split('T')[0] : new Date(dateStr).toISOString().split('T')[0];
    return {
      date,
      score: p.validity || 0,
      risk: p.entropy || 0
    };
  });

export const mapAnchorsToBarSeries = (anchors: AnchorData[]): Array<{ anchor: string; count: number }> =>
  anchors.map((anchor) => ({
    anchor: anchor.word,
    count: anchor.count ?? 1
  }));
