import { performance } from "perf_hooks";

const pathLessons = Array.from({ length: 1000 }, (_, i) => ({ id: `lesson-${i}` }));
const completedLessons = Array.from({ length: 900 }, (_, i) => `lesson-${i}`);

function baseline() {
  const start = performance.now();
  for(let i=0; i<100; i++) {
    const nextLesson = pathLessons.find((lesson) => !completedLessons.includes(lesson.id)) ?? pathLessons[0];
  }
  const end = performance.now();
  return end - start;
}

function optimized() {
  const start = performance.now();
  const completedSet = new Set(completedLessons);
  for(let i=0; i<100; i++) {
    const nextLesson = pathLessons.find((lesson) => !completedSet.has(lesson.id)) ?? pathLessons[0];
  }
  const end = performance.now();
  return end - start;
}

console.log(`Baseline Avg: ${baseline()} ms`);
console.log(`Optimized Avg: ${optimized()} ms`);
