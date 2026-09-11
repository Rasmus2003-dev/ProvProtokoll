import { buildTestQuestions } from '../../src/data/mockQuestions';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { testId, answers } = (await req.json()) as { testId: string; answers: Record<number, number> };
    if (!testId) {
      return new Response(JSON.stringify({ error: 'testId saknas' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const questions = buildTestQuestions(testId);
    const categoryScores: Record<number, { correct: number; total: number }> = {
      1: { correct: 0, total: 0 },
      2: { correct: 0, total: 0 },
      3: { correct: 0, total: 0 },
      4: { correct: 0, total: 0 },
      5: { correct: 0, total: 0 },
    };

    let score = 0;
    questions.forEach((q, idx) => {
      const studentAns = answers?.[idx];
      const cat = q.categoryId || 4;
      if (!categoryScores[cat]) categoryScores[cat] = { correct: 0, total: 0 };
      categoryScores[cat].total += 1;
      if (studentAns === q.correct) {
        score += 1;
        categoryScores[cat].correct += 1;
      }
    });

    const total = questions.length;
    const passedLimit = Math.ceil(total * 0.8);
    const passed = score >= passedLimit;

    return new Response(JSON.stringify({ score, total, passed, categoryScores }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Kunde inte rätta provet' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
