import { performance } from "perf_hooks";

const lessons = Array.from({ length: 10000 }, (_, i) => ({ id: `lesson-${i}` }));
const completedLessons = Array.from({ length: 9999 }, (_, i) => `lesson-${i}`);
const activePath = { path: { lessons: Array.from({ length: 10000 }, (_, i) => `lesson-${i}`) } };

function findNextLessonBaseline() {
  const start = performance.now();
  const nextLesson = activePath
    ? (lessons.find(
        (lesson) => activePath.path.lessons.includes(lesson.id) && !completedLessons.includes(lesson.id)
      ) ?? lessons.find((lesson) => activePath.path.lessons.includes(lesson.id)))
    : undefined;
  const end = performance.now();
  return end - start;
}

function findNextLessonOptimized() {
  const start = performance.now();
  const activePathLessonsSet = new Set(activePath?.path.lessons || []);
  const completedLessonsSet = new Set(completedLessons);
  const nextLesson = activePath
    ? (lessons.find(
        (lesson) => activePathLessonsSet.has(lesson.id) && !completedLessonsSet.has(lesson.id)
      ) ?? lessons.find((lesson) => activePathLessonsSet.has(lesson.id)))
    : undefined;
  const end = performance.now();
  return end - start;
}

let baseSum = 0;
let optSum = 0;
const iterations = 10;

for (let i = 0; i < iterations; i++) {
  baseSum += findNextLessonBaseline();
  optSum += findNextLessonOptimized();
}

console.log(`Baseline Avg: ${baseSum / iterations} ms`);
console.log(`Optimized Avg: ${optSum / iterations} ms`);
