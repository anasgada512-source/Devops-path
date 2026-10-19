// Small builders so the content files stay readable.
// Lesson content uses a tiny markup: ## headings, **bold**, {{inline code}},
// - lists, > tips, | tables |, and code fences written with ~~~lang  (add "run" to make it runnable).

export const lesson = (slug, title, summary, minutes, content) => ({
  slug,
  title,
  summary,
  minutes,
  content: content.trim(),
});

export const topic = (slug, stage, icon, title, description, outcomes, lessons) => ({
  slug,
  stage,
  icon,
  title,
  description,
  outcomes,
  lessons,
});
