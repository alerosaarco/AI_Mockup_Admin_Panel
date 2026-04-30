// All dates relative to April 30, 2026
function daysAgo(n) {
  const d = new Date('2026-04-30')
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export const NODES = {
  'Grammar & Style': [
    { id: 'orchestrator', name: 'Orchestrator', type: 'Router', desc: 'Routes input to child agents', prompt: `You are the Orchestrator for the Grammar & Style assistant.\nYour role is to analyze incoming text and route it to the appropriate child agents.\n\nInstructions:\n1. Parse the input text for grammatical issues\n2. Identify which agents are needed\n3. Aggregate results from child agents\n4. Return a unified set of suggestions\n\nAlways respond in JSON format with a "suggestions" array.` },
    { id: 'grammar', name: 'Grammar Agent', type: 'LLM', desc: 'Detects grammatical errors', prompt: `You are a Grammar Agent specialized in detecting grammatical errors in educational text.\n\nFocus on:\n- Subject-verb agreement\n- Tense consistency\n- Article usage\n- Pronoun agreement\n\nInput: a paragraph of text\nOutput: JSON array of corrections with position, original, and suggestion fields.\n\nExample:\n[\n  {\n    "position": 12,\n    "original": "students was",\n    "suggestion": "students were",\n    "rule": "subject-verb agreement"\n  }\n]` },
    { id: 'style', name: 'Style Agent', type: 'LLM', desc: 'Improves writing style and flow', prompt: `You are a Style Agent that improves writing style for clarity and readability.\n\nGuidelines:\n- Prefer active voice over passive\n- Avoid redundant phrases\n- Keep sentences concise (under 25 words)\n- Match appropriate reading level for educational content\n\nReturn: JSON array of style suggestions with original span and rewrite.` },
    { id: 'redundancy', name: 'Redundancy Detector', type: 'Tool', desc: 'Flags repeated content and filler phrases', prompt: `You are a Redundancy Detector. Identify repeated words, phrases, or ideas within a paragraph.\n\nFlag:\n- Exact word repetition within 3 sentences\n- Semantic repetition (same idea stated twice)\n- Filler phrases: "it is important to note that", "as we can see", "in conclusion"\n\nReturn: JSON list of flagged spans with explanation and suggested removal.` },
    { id: 'clarity', name: 'Clarity Agent', type: 'LLM', desc: 'Enhances sentence clarity and readability', prompt: `You are a Clarity Agent. Your goal is to make sentences clearer and easier to understand.\n\nApproach:\n- Break up long sentences (>30 words)\n- Replace complex vocabulary with simpler alternatives\n- Ensure logical flow between sentences\n- Remove ambiguous pronouns\n- Use concrete language instead of abstract\n\nReturn: rewritten paragraph with a tracked-changes diff object.` },
  ],
  'Factual Accuracy': [
    { id: 'orchestrator', name: 'Orchestrator', type: 'Router', desc: 'Routes claims for verification', prompt: `You are the Orchestrator for the Factual Accuracy assistant.\nRoute each factual claim to the appropriate verification agent.` },
    { id: 'claim', name: 'Claim Extractor', type: 'LLM', desc: 'Extracts verifiable claims', prompt: `Extract all verifiable factual claims from the input text.\nReturn each claim as a JSON object with text, type, and confidence fields.` },
    { id: 'verify', name: 'Verification Agent', type: 'Tool', desc: 'Verifies claims against knowledge base', prompt: `Verify the provided claim against the educational knowledge base.\nReturn: verified (true/false), confidence (0-1), source, and correction if needed.` },
  ],
  'Punctuation': [
    { id: 'orchestrator', name: 'Orchestrator', type: 'Router', desc: 'Coordinates punctuation checks', prompt: `Orchestrator for Punctuation assistant. Route text for comma, period, and special character checks.` },
    { id: 'comma', name: 'Comma Agent', type: 'LLM', desc: 'Checks comma placement rules', prompt: `Check comma usage in the provided text. Apply Chicago Manual of Style rules for educational content.` },
    { id: 'punctuation', name: 'Punctuation Agent', type: 'LLM', desc: 'Handles all other punctuation', prompt: `Check all punctuation marks except commas: periods, semicolons, colons, em-dashes, and quotation marks.` },
  ],
  'Bilingual Review': [
    { id: 'orchestrator', name: 'Orchestrator', type: 'Router', desc: 'Coordinates bilingual checks', prompt: `Orchestrator for Bilingual Review. Detect language and route to appropriate agents.` },
    { id: 'lang', name: 'Language Detector', type: 'Tool', desc: 'Identifies language of text segments', prompt: `Detect the language of each sentence or segment. Support Portuguese and English.` },
    { id: 'trans', name: 'Translation Agent', type: 'LLM', desc: 'Reviews translation accuracy', prompt: `Review the bilingual content for translation accuracy, register consistency, and cultural appropriateness.` },
  ],
  'Socioemotional Tone': [
    { id: 'orchestrator', name: 'Orchestrator', type: 'Router', desc: 'Coordinates tone analysis', prompt: `Orchestrator for Socioemotional Tone assistant.` },
    { id: 'tone', name: 'Tone Analyzer', type: 'LLM', desc: 'Detects emotional tone and register', prompt: `Analyze the socioemotional tone of the text. Identify if it is appropriate for the target age group and educational context.` },
    { id: 'suggest', name: 'Tone Rewriter', type: 'LLM', desc: 'Rewrites for appropriate tone', prompt: `Rewrite flagged sections to match the required socioemotional register while preserving the original meaning.` },
  ],
}

// Generic nodes for assistants not in the above map
const GENERIC_NODES = (name) => [
  { id: 'orchestrator', name: 'Orchestrator', type: 'Router', desc: `Routes input for ${name}`, prompt: `You are the Orchestrator for the ${name} assistant.\nRoute input to child agents as appropriate.` },
  { id: 'analyzer', name: 'Analyzer Agent', type: 'LLM', desc: 'Analyzes content against rules', prompt: `Analyze the provided content according to the ${name} guidelines.\nReturn a JSON array of findings with severity, position, and suggestion.` },
  { id: 'reporter', name: 'Report Agent', type: 'Tool', desc: 'Formats and aggregates results', prompt: `Aggregate findings from the Analyzer Agent and format them into a structured report suitable for CMS integration.` },
]

export function getNodes(assistantName) {
  return NODES[assistantName] || GENERIC_NODES(assistantName)
}

export const PROBLEM_SCORES = {
  'Grammar & Style': [
    { problem: 'Subject-Verb Agreement', score: 92, prev: 89 },
    { problem: 'Comma Usage', score: 88, prev: 86 },
    { problem: 'Sentence Clarity', score: 84, prev: 85 },
    { problem: 'Redundancy', score: 79, prev: 74 },
    { problem: 'Passive Voice', score: 71, prev: 73 },
  ],
  'Factual Accuracy': [
    { problem: 'Historical Facts', score: 91, prev: 88 },
    { problem: 'Scientific Claims', score: 86, prev: 84 },
    { problem: 'Statistical Data', score: 78, prev: 76 },
    { problem: 'Geographic Info', score: 83, prev: 80 },
  ],
  'Punctuation': [
    { problem: 'Comma Usage', score: 94, prev: 92 },
    { problem: 'Period Placement', score: 97, prev: 96 },
    { problem: 'Semicolon Usage', score: 82, prev: 79 },
  ],
}

export function getProblemScores(assistantName) {
  return PROBLEM_SCORES[assistantName] || [
    { problem: 'Primary Check', score: 87, prev: 84 },
    { problem: 'Secondary Check', score: 82, prev: 80 },
    { problem: 'Tertiary Check', score: 76, prev: 75 },
  ]
}

const TREND_PALETTE = ['#6366f1', '#22d3ee', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa', '#34d399']

// Deterministic "jitter" based on problem name + week index so values are stable
function seed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function getEvalTrendData(assistantName) {
  const problems = getProblemScores(assistantName)
  return Array.from({ length: 8 }, (_, week) => {
    const row = { date: daysAgo(49 - week * 7) }
    problems.forEach(({ problem, score, prev }) => {
      const base = prev + ((score - prev) * week) / 7
      const jitter = ((seed(problem + week) % 5) - 2) * 0.4
      row[problem] = Math.round((base + jitter) * 10) / 10
    })
    return row
  })
}

export function getProblemTrendColors(assistantName) {
  const problems = getProblemScores(assistantName)
  return Object.fromEntries(problems.map(({ problem }, i) => [problem, TREND_PALETTE[i % TREND_PALETTE.length]]))
}

export function getEvalProblemTable(assistantName) {
  const problems = getProblemScores(assistantName)
  return problems.map(({ problem, score, prev }, i) => ({
    problem,
    latestF1: score,
    prevF1: prev,
    rowsEvaluated: 20 + (seed(problem) % 20),
    lastRun: daysAgo(0),
    history: [prev - 2, prev, score],
  }))
}

export const EVAL_RUN_HISTORY = [
  { id: 'RUN-2841', date: daysAgo(0),  type: 'Eval',       dataset: 'v3', rows: 142, avgF1: 83.8, status: 'success' },
  { id: 'RUN-2840', date: daysAgo(2),  type: 'Eval', dataset: 'v3', rows: 30,  avgF1: 84.1, status: 'success' },
  { id: 'RUN-2839', date: daysAgo(5),  type: 'CMS',        dataset: '-',  rows: 211, avgF1: null, status: 'success' },
  { id: 'RUN-2837', date: daysAgo(7),  type: 'Eval',       dataset: 'v3', rows: 142, avgF1: 83.2, status: 'success' },
  { id: 'RUN-2835', date: daysAgo(10), type: 'Eval', dataset: 'v2', rows: 30,  avgF1: 82.8, status: 'success' },
  { id: 'RUN-2831', date: daysAgo(14), type: 'Eval',       dataset: 'v2', rows: 138, avgF1: 82.5, status: 'success' },
  { id: 'RUN-2829', date: daysAgo(17), type: 'CMS',        dataset: '-',  rows: 198, avgF1: null, status: 'error' },
  { id: 'RUN-2824', date: daysAgo(21), type: 'Eval',       dataset: 'v2', rows: 138, avgF1: 81.9, status: 'success' },
]

export const GOLDEN_DATASET_ROWS = [
  { id: 1, problemType: 'Subject-Verb Agreement', inputText: 'Os alunos foi ao parque ontem com a professora de ciências.', expectedOutput: 'Os alunos foram ao parque ontem com a professora de ciências.', aiOutput: 'Os alunos foram ao parque ontem com a professora de ciências.', judgeResult: 'correct', score: 1.0 },
  { id: 2, problemType: 'Subject-Verb Agreement', inputText: 'The students was excited about the upcoming science fair project.', expectedOutput: 'The students were excited about the upcoming science fair project.', aiOutput: 'The students were excited about the upcoming science fair project.', judgeResult: 'correct', score: 1.0 },
  { id: 3, problemType: 'Comma Usage', inputText: 'During the experiment students observed that water evaporates quickly in warm dry conditions.', expectedOutput: 'During the experiment, students observed that water evaporates quickly in warm, dry conditions.', aiOutput: 'During the experiment students observed that water evaporates quickly in warm, dry conditions.', judgeResult: 'incorrect', score: 0.5 },
  { id: 4, problemType: 'Sentence Clarity', inputText: 'The process by which the thing that makes plants green captures energy from the sun is called photosynthesis.', expectedOutput: 'The process by which chlorophyll captures energy from the sun is called photosynthesis.', aiOutput: 'The process by which chlorophyll captures solar energy is called photosynthesis.', judgeResult: 'correct', score: 0.9 },
  { id: 5, problemType: 'Redundancy', inputText: 'It is important to note that the water cycle is an important natural process that is important for all living things.', expectedOutput: 'The water cycle is a natural process essential for all living things.', aiOutput: 'The water cycle is an important natural process essential for all living things.', judgeResult: 'incorrect', score: 0.6 },
  { id: 6, problemType: 'Passive Voice', inputText: 'The experiment was conducted by the students in the laboratory under the supervision of the teacher.', expectedOutput: 'The students conducted the experiment in the laboratory under the teacher\'s supervision.', aiOutput: 'The students conducted the experiment in the laboratory under the teacher\'s supervision.', judgeResult: 'correct', score: 1.0 },
  { id: 7, problemType: 'Subject-Verb Agreement', inputText: 'Each of the chapters in the textbook contain a summary and review questions.', expectedOutput: 'Each of the chapters in the textbook contains a summary and review questions.', aiOutput: 'Each of the chapters in the textbook contains a summary and review questions.', judgeResult: 'correct', score: 1.0 },
  { id: 8, problemType: 'Comma Usage', inputText: 'The teacher explained the concept carefully but the students still had many questions.', expectedOutput: 'The teacher explained the concept carefully, but the students still had many questions.', aiOutput: 'The teacher explained the concept carefully, but the students still had many questions.', judgeResult: 'correct', score: 1.0 },
  { id: 9, problemType: 'Sentence Clarity', inputText: 'When thinking about it the thing that causes seasons is the tilt of the Earth.', expectedOutput: 'Seasons are caused by the tilt of the Earth\'s axis relative to the sun.', aiOutput: 'The tilt of the Earth causes the seasons we experience throughout the year.', judgeResult: 'correct', score: 0.85 },
  { id: 10, problemType: 'Passive Voice', inputText: 'Ancient Rome was built by its citizens over many centuries and was eventually conquered by barbarian tribes.', expectedOutput: 'Citizens built Ancient Rome over many centuries until barbarian tribes eventually conquered it.', aiOutput: null, judgeResult: 'pending', score: null },
]

export const AB_TESTS = [
  {
    id: 'ab-001',
    name: 'Clarity Agent Prompt v2 Test',
    created: daysAgo(12),
    status: 'active',
    variants: [
      { id: 'A', label: 'A (Production)', isBaseline: true, modified: [], scores: { 'Subject-Verb Agreement': 92, 'Comma Usage': 88, 'Sentence Clarity': 84, 'Redundancy': 79, 'Passive Voice': 71 }, promptDiff: null },
      {
        id: 'B', label: 'B', isBaseline: false, modified: ['Clarity Agent'],
        scores: { 'Subject-Verb Agreement': 92, 'Comma Usage': 88, 'Sentence Clarity': 89, 'Redundancy': 81, 'Passive Voice': 73 },
        promptDiff: [
          { type: 'context', text: 'You are a Clarity Agent. Your goal is to make sentences clearer.' },
          { type: 'removed', text: 'Approach:\n- Break up long sentences\n- Replace complex words with simpler alternatives' },
          { type: 'added',   text: 'Approach:\n- Break up sentences longer than 25 words into two concise sentences\n- Replace Latinate vocabulary with Anglo-Saxon equivalents where possible\n- Target Flesch-Kincaid Grade Level 6-8 for middle school content' },
          { type: 'context', text: '\nReturn: rewritten paragraph with tracked changes.' },
        ],
      },
      {
        id: 'C', label: 'C', isBaseline: false, modified: ['Clarity Agent', 'Style Agent'],
        scores: { 'Subject-Verb Agreement': 91, 'Comma Usage': 87, 'Sentence Clarity': 87, 'Redundancy': 83, 'Passive Voice': 75 },
        promptDiff: [
          { type: 'context', text: 'You are a Clarity Agent. Your goal is to make sentences clearer.' },
          { type: 'removed', text: 'Approach:\n- Break up long sentences\n- Replace complex words with simpler alternatives\n- Ensure logical flow between sentences\n- Remove ambiguous pronouns' },
          { type: 'added',   text: 'Approach:\n- Maximum sentence length: 20 words\n- Use transition words to ensure logical flow\n- Replace all pronouns with explicit nouns on first use\n- Prefer bullet points for lists of 3+ items' },
          { type: 'context', text: '\nReturn: rewritten paragraph with tracked changes.' },
        ],
      },
    ],
  },
  {
    id: 'ab-002',
    name: 'Redundancy Detector Rewrite',
    created: daysAgo(28),
    status: 'completed',
    winner: 'B',
    winnerSummary: 'Variant B outperforms A on 4/5 problems (+6.2 F1 avg)',
    variants: [
      { id: 'A', label: 'A (Production)', isBaseline: true, modified: [], scores: { 'Subject-Verb Agreement': 90, 'Comma Usage': 86, 'Sentence Clarity': 82, 'Redundancy': 71, 'Passive Voice': 70 }, promptDiff: null },
      {
        id: 'B', label: 'B', isBaseline: false, modified: ['Redundancy Detector'],
        scores: { 'Subject-Verb Agreement': 91, 'Comma Usage': 87, 'Sentence Clarity': 84, 'Redundancy': 82, 'Passive Voice': 74 },
        promptDiff: [
          { type: 'context', text: 'You are a Redundancy Detector. Identify repeated words, phrases, or ideas.' },
          { type: 'removed', text: 'Flag:\n- Exact word repetition within 3 sentences\n- Semantic repetition (same idea stated twice)\n- Filler phrases like "it is important to note that"' },
          { type: 'added',   text: 'Flag:\n- Exact word repetition within 5 sentences\n- Semantic redundancy across paragraph boundaries\n- Common filler phrases (see attached list of 47 patterns)\n- Transitional redundancy where consecutive sentences repeat the topic\n- Over-qualification ("very unique", "completely finished")' },
          { type: 'context', text: '\nReturn: JSON list of flagged spans with explanation.' },
        ],
      },
    ],
  },
  {
    id: 'ab-003',
    name: 'Add Formality Agent',
    created: daysAgo(5),
    status: 'draft',
    variants: [
      { id: 'A', label: 'A (Production)', isBaseline: true, modified: [], scores: {}, promptDiff: null },
      { id: 'B', label: 'B', isBaseline: false, modified: ['+ Formality Agent (new)'], scores: {}, promptDiff: [{ type: 'added', text: '+ New node: Formality Agent\n  Type: LLM\n  Prompt: Evaluate and adjust the formality register of text\n  to match academic educational standards (B2-C1 level).' }] },
    ],
  },
]

export const PROMPT_VERSIONS = [
  { version: 7, date: daysAgo(6),  author: 'Maria L.',  note: 'Improved sentence-level examples', current: true },
  { version: 6, date: daysAgo(14), author: 'Carlos M.', note: 'Added Portuguese language support' },
  { version: 5, date: daysAgo(21), author: 'Priya S.',  note: 'Tuned subject-verb rules' },
  { version: 4, date: daysAgo(30), author: 'Maria L.',  note: 'Initial production version' },
  { version: 3, date: daysAgo(40), author: 'João R.',   note: 'Beta draft' },
]

export const PROMPT_CONTENTS = {
  7: `You are a Grammar Agent specialized in detecting grammatical errors in educational text.\n\nFocus on:\n- Subject-verb agreement\n- Tense consistency\n- Article usage (a, an, the)\n- Pronoun agreement\n- Parallel structure in lists\n\nInput: a paragraph of text\nOutput: JSON array of corrections with position, original, and suggestion fields.\n\nGuidelines:\n- Only flag clear grammatical errors, not stylistic preferences\n- For Portuguese text, apply BNCC grammar standards\n- Confidence threshold: 0.8 — do not suggest if unsure\n\nExample output:\n[\n  {\n    "position": 12,\n    "original": "students was",\n    "suggestion": "students were",\n    "rule": "subject-verb agreement",\n    "confidence": 0.98\n  }\n]`,
  6: `You are a Grammar Agent specialized in detecting grammatical errors in educational text.\n\nFocus on:\n- Subject-verb agreement\n- Tense consistency\n- Article usage\n- Pronoun agreement\n\nInput: a paragraph of text\nOutput: JSON array of corrections with position, original, and suggestion fields.\n\nGuidelines:\n- Only flag clear grammatical errors\n- Supports Portuguese and English text\n- Confidence threshold: 0.75`,
  5: `You are a Grammar Agent specialized in detecting grammatical errors in educational text.\n\nFocus on:\n- Subject-verb agreement\n- Tense consistency\n- Article usage\n- Pronoun agreement\n\nInput: a paragraph of text\nOutput: JSON array of corrections with position, original, and suggestion fields.`,
}

// 30 days of daily CMS acceptance data
export const CMS_DAILY_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: daysAgo(29 - i),
  rate: Math.round((88 + Math.sin(i * 0.4) * 4 + Math.random() * 2) * 10) / 10,
  accepted: Math.round(140 + Math.sin(i * 0.3) * 20),
  rejected: Math.round(14 + Math.cos(i * 0.3) * 4),
}))

export const CMS_PROBLEM_BREAKDOWN = [
  { problem: 'Subject-Verb Agreement', total: 1241, accepted: 1152, rejected: 89,  rate: 92.8, trend: [90, 91, 92, 93, 92.8] },
  { problem: 'Comma Usage',            total: 987,  accepted: 895,  rejected: 92,  rate: 90.7, trend: [88, 89, 90, 91, 90.7] },
  { problem: 'Sentence Clarity',       total: 834,  accepted: 742,  rejected: 92,  rate: 88.9, trend: [86, 87, 88, 89, 88.9] },
  { problem: 'Redundancy',             total: 623,  accepted: 541,  rejected: 82,  rate: 86.8, trend: [83, 84, 85, 87, 86.8] },
  { problem: 'Passive Voice',          total: 712,  accepted: 618,  rejected: 94,  rate: 86.8, trend: [84, 85, 86, 87, 86.8] },
  { problem: 'Style',                  total: 424,  accepted: 376,  rejected: 48,  rate: 88.7, trend: [86, 87, 88, 89, 88.7] },
]

export const CMS_CHAPTER_BREAKDOWN = [
  { chapter: 'Chapter 3: The Water Cycle',    subject: 'Science',  total: 312, rate: 93.2, topRejection: 'Changed wording' },
  { chapter: 'Unit 5: Fractions',             subject: 'Math',     total: 287, rate: 89.5, topRejection: 'Kept original' },
  { chapter: 'Chapter 8: Ancient Rome',       subject: 'History',  total: 256, rate: 91.8, topRejection: 'Tone wrong' },
  { chapter: 'Unit 2: Plant Biology',         subject: 'Science',  total: 341, rate: 94.1, topRejection: 'Changed wording' },
  { chapter: 'Chapter 6: Brazilian History',  subject: 'History',  total: 198, rate: 87.4, topRejection: 'Factually incorrect' },
  { chapter: 'Unit 9: Grammar Fundamentals',  subject: 'Language', total: 423, rate: 95.0, topRejection: 'Partial accept' },
]

export const CMS_USER_BREAKDOWN = [
  { user: 'Maria L.',  role: 'Senior Editor', total: 1243, rate: 93.4, avgResponse: '2.1s' },
  { user: 'Carlos M.', role: 'Editor',        total: 987,  rate: 91.2, avgResponse: '3.4s' },
  { user: 'Priya S.',  role: 'Editor',        total: 834,  rate: 89.7, avgResponse: '4.1s' },
  { user: 'João R.',   role: 'Junior Editor', total: 612,  rate: 87.3, avgResponse: '5.2s' },
  { user: 'Ana T.',    role: 'Senior Editor', total: 723,  rate: 94.1, avgResponse: '1.8s' },
  { user: 'Lucas F.',  role: 'Junior Editor', total: 422,  rate: 85.8, avgResponse: '6.3s' },
]

export const REJECTION_REASONS = [
  { reason: 'Changed wording', count: 142 },
  { reason: 'Kept original',   count: 118 },
  { reason: 'Tone wrong',      count: 87 },
  { reason: 'Partial accept',  count: 64 },
  { reason: 'Factually incorrect', count: 19 },
]

const TRACE_NODES = [
  { node: 'Orchestrator',        duration: 0.3, status: 'success', tokens: 312  },
  { node: 'Grammar Agent',       duration: 1.1, status: 'success', tokens: 1840 },
  { node: 'Style Agent',         duration: 0.9, status: 'success', tokens: 1620 },
  { node: 'Redundancy Detector', duration: 0.5, status: 'success', tokens: 890  },
  { node: 'Clarity Agent',       duration: 0.8, status: 'success', tokens: 1430 },
]

export const TRACES = [
  { id: 'TRC-9921', date: daysAgo(0)  + ' 14:22', source: 'CMS',  duration: 3.6, status: 'success', tokens: 6092, steps: TRACE_NODES, input: 'Os alunos foi ao parque ontem com a professora de ciências naturais.', output: 'Os alunos foram ao parque ontem com a professora de ciências naturais.' },
  { id: 'TRC-9920', date: daysAgo(0)  + ' 13:45', source: 'CMS',  duration: 4.1, status: 'success', tokens: 7210, steps: TRACE_NODES, input: 'The students was very excited about the upcoming science fair and they was preparing their projects.', output: 'The students were very excited about the upcoming science fair and were preparing their projects.' },
  { id: 'TRC-9918', date: daysAgo(0)  + ' 11:30', source: 'Eval', duration: 3.4, status: 'success', tokens: 5890, steps: TRACE_NODES, input: 'During the experiment students observed that water evaporates quickly in warm dry conditions.', output: 'During the experiment, students observed that water evaporates quickly in warm, dry conditions.' },
  { id: 'TRC-9915', date: daysAgo(1)  + ' 16:10', source: 'CMS',  duration: 6.8, status: 'error',   tokens: 2100, steps: [
    { node: 'Orchestrator', duration: 0.3, status: 'success', tokens: 312 },
    { node: 'Grammar Agent', duration: 5.1, status: 'error', tokens: 1788, error: 'LLM timeout after 5000ms — context length exceeded (8192 tokens). Input text was 4,200 words, exceeding single-pass limit.' },
  ], input: 'Ancient Rome was built by its citizens over many centuries...', output: null },
  { id: 'TRC-9912', date: daysAgo(1)  + ' 10:02', source: 'CMS',  duration: 2.8, status: 'success', tokens: 4920, steps: TRACE_NODES.slice(0, 4), input: 'Each of the chapters in the textbook contain a summary at the end.', output: 'Each of the chapters in the textbook contains a summary at the end.' },
  { id: 'TRC-9908', date: daysAgo(2)  + ' 15:33', source: 'Eval', duration: 3.1, status: 'success', tokens: 5421, steps: TRACE_NODES, input: 'It is important to note that the water cycle is an important process that is important for life.', output: 'The water cycle is a process essential for all life.' },
  { id: 'TRC-9903', date: daysAgo(2)  + ' 09:11', source: 'CMS',  duration: 1.2, status: 'success', tokens: 2103, steps: TRACE_NODES.slice(0, 2), input: 'The teacher explained the concept carefully but the students still had many questions.', output: 'The teacher explained the concept carefully, but the students still had many questions.' },
  { id: 'TRC-9897', date: daysAgo(3)  + ' 14:55', source: 'CMS',  duration: 3.9, status: 'success', tokens: 6340, steps: TRACE_NODES, input: 'The experiment was conducted by the students in the laboratory under the supervision of the teacher.', output: 'The students conducted the experiment in the laboratory under the teacher\'s supervision.' },
  { id: 'TRC-9891', date: daysAgo(4)  + ' 11:20', source: 'Eval', duration: 2.6, status: 'success', tokens: 4710, steps: TRACE_NODES.slice(0, 4), input: 'A fotossíntese é um processo pelo qual as plantas produz energia a partir da luz solar.', output: 'A fotossíntese é um processo pelo qual as plantas produzem energia a partir da luz solar.' },
  { id: 'TRC-9884', date: daysAgo(5)  + ' 16:40', source: 'CMS',  duration: 4.3, status: 'success', tokens: 7100, steps: TRACE_NODES, input: 'Fractions is a fundamental concept in mathematics that students need to understand well.', output: 'Fractions are a fundamental concept in mathematics that students need to understand well.' },
]

export const RUN_HISTORY_FULL = [
  { id: 'RUN-2841', date: daysAgo(0),  time: '14:30', type: 'Eval',       dataset: 'Grammar & Style — v3', rows: 142, avgF1: 83.8, avgLatency: '3.4s', tokens: '142K', status: 'success' },
  { id: 'RUN-2840', date: daysAgo(0),  time: '10:15', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 67,  avgF1: null, avgLatency: '3.1s', tokens: '89K',  status: 'success' },
  { id: 'RUN-2839', date: daysAgo(1),  time: '16:45', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 211, avgF1: null, avgLatency: '4.2s', tokens: '287K', status: 'success' },
  { id: 'RUN-2838', date: daysAgo(1),  time: '09:00', type: 'Eval', dataset: 'Grammar & Style — v3', rows: 30,  avgF1: 84.1, avgLatency: '3.3s', tokens: '28K',  status: 'success' },
  { id: 'RUN-2837', date: daysAgo(2),  time: '15:20', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 94,  avgF1: null, avgLatency: '3.8s', tokens: '124K', status: 'success' },
  { id: 'RUN-2836', date: daysAgo(3),  time: '11:40', type: 'Eval',       dataset: 'Grammar & Style — v3', rows: 142, avgF1: 83.2, avgLatency: '3.5s', tokens: '140K', status: 'success' },
  { id: 'RUN-2835', date: daysAgo(4),  time: '14:10', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 178, avgF1: null, avgLatency: '3.6s', tokens: '231K', status: 'success' },
  { id: 'RUN-2834', date: daysAgo(5),  time: '09:30', type: 'Eval', dataset: 'Grammar & Style — v2', rows: 30,  avgF1: 82.8, avgLatency: '3.4s', tokens: '27K',  status: 'success' },
  { id: 'RUN-2833', date: daysAgo(6),  time: '16:00', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 56,  avgF1: null, avgLatency: '5.1s', tokens: '71K',  status: 'error' },
  { id: 'RUN-2832', date: daysAgo(7),  time: '13:25', type: 'Eval',       dataset: 'Grammar & Style — v2', rows: 138, avgF1: 82.5, avgLatency: '3.7s', tokens: '136K', status: 'success' },
  { id: 'RUN-2831', date: daysAgo(8),  time: '10:50', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 143, avgF1: null, avgLatency: '3.2s', tokens: '189K', status: 'success' },
  { id: 'RUN-2830', date: daysAgo(9),  time: '15:30', type: 'Eval', dataset: 'Grammar & Style — v2', rows: 30,  avgF1: 82.1, avgLatency: '3.6s', tokens: '28K',  status: 'success' },
  { id: 'RUN-2829', date: daysAgo(10), time: '11:15', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 198, avgF1: null, avgLatency: '6.8s', tokens: '264K', status: 'error' },
  { id: 'RUN-2828', date: daysAgo(11), time: '09:45', type: 'Eval',       dataset: 'Grammar & Style — v2', rows: 138, avgF1: 81.9, avgLatency: '3.4s', tokens: '138K', status: 'success' },
  { id: 'RUN-2827', date: daysAgo(12), time: '14:00', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 88,  avgF1: null, avgLatency: '3.3s', tokens: '114K', status: 'success' },
  { id: 'RUN-2826', date: daysAgo(14), time: '16:20', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 234, avgF1: null, avgLatency: '3.5s', tokens: '312K', status: 'success' },
  { id: 'RUN-2825', date: daysAgo(15), time: '10:00', type: 'Eval', dataset: 'Grammar & Style — v2', rows: 30,  avgF1: 81.4, avgLatency: '3.7s', tokens: '27K',  status: 'success' },
  { id: 'RUN-2824', date: daysAgo(17), time: '13:40', type: 'Eval',       dataset: 'Grammar & Style — v2', rows: 138, avgF1: 80.8, avgLatency: '3.6s', tokens: '135K', status: 'success' },
  { id: 'RUN-2823', date: daysAgo(19), time: '11:00', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 167, avgF1: null, avgLatency: '3.4s', tokens: '218K', status: 'success' },
  { id: 'RUN-2822', date: daysAgo(21), time: '15:10', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 143, avgF1: null, avgLatency: '3.9s', tokens: '186K', status: 'success' },
  { id: 'RUN-2821', date: daysAgo(23), time: '09:20', type: 'Eval',       dataset: 'Grammar & Style — v1', rows: 130, avgF1: 79.3, avgLatency: '3.8s', tokens: '128K', status: 'success' },
  { id: 'RUN-2820', date: daysAgo(25), time: '14:50', type: 'Eval', dataset: 'Grammar & Style — v1', rows: 30,  avgF1: 79.1, avgLatency: '3.5s', tokens: '26K',  status: 'success' },
  { id: 'RUN-2819', date: daysAgo(28), time: '10:30', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 189, avgF1: null, avgLatency: '3.7s', tokens: '245K', status: 'success' },
  { id: 'RUN-2818', date: daysAgo(32), time: '13:00', type: 'Eval',       dataset: 'Grammar & Style — v1', rows: 130, avgF1: 78.4, avgLatency: '4.1s', tokens: '127K', status: 'success' },
  { id: 'RUN-2817', date: daysAgo(35), time: '11:45', type: 'CMS Live',   dataset: 'Live CMS Feed',         rows: 112, avgF1: null, avgLatency: '3.3s', tokens: '147K', status: 'success' },
]

export const RECENT_RUNS = RUN_HISTORY_FULL.slice(0, 5)
