//explicitly adding some tags and there references
const rules = [
  {
    tags: ['python', 'machine learning', 'deep learning'],
    projects: [
      "Build a paper classifier using Scikit-learn",
      "Create a research trend visualizer with Python",
    ],
  },
  {
    tags: ['nlp', 'bert', 'transformers'],
    projects: [
      "Summarize papers using HuggingFace Transformers",
      "Build a resume ranker using BERT",
    ],
  },
  {
    tags: ['node.js', 'express', 'postgresql'],
    projects: [
      "Build a secure Express.js API with JWT and Redis",
      "Create a full-stack app using Node.js and PostgreSQL",
    ],
  },
  {
    tags: ['flask', 'mysql', 'jwt'],
    projects: [
      "Develop a secure banking system with Flask and JWT",
      "Build a personal finance tracker with Flask and MySQL",
    ],
  },
];

function getSuggestionsFromCombinedData(combinedText) {
  const suggestions = new Set();

  for (const rule of rules) {
    if (rule.tags.some(tag => combinedText.includes(tag))) {
      rule.projects.forEach(p => suggestions.add(p));
    }
  }

  return Array.from(suggestions);
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resumeData, scholarData } = req.body;

  if (!resumeData && !scholarData) {
    return res.status(400).json({ error: 'Please provide at least resume or scholar data.' });
  }

  const combined = [
    ...(resumeData?.skills || []),
    ...(resumeData?.experience || []),
    ...(resumeData?.education || []),
    ...(scholarData?.interests || []),
    ...(scholarData?.publications || []).map(p => p.title),
  ].join(" ").toLowerCase();

  const suggestions = getSuggestionsFromCombinedData(combined);

  res.status(200).json({ suggestions });
}
