// pages/api/parse-resume.js
import { extractLinksFromPDF } from '@/lib/extractLinks';
import { extractLinksFromDOCX } from '@/lib/extractLinksFromDOCX';

import formidable from 'formidable';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir: '/tmp',
    filename: (name, ext, part) => `${Date.now()}-${part.originalFilename}`,
    });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const file = Array.isArray(files.resume) ? files.resume[0] : files.resume;

    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploaded file path:', file.filepath);

    try {
      // Read file into buffer
      const buffer = fs.readFileSync(file.filepath);
      fs.unlink(file.filepath, (err) => {
        if (err) console.warn('Failed to clean up temp file:', err);
      });

      const fileExt = file.originalFilename?.split('.').pop().toLowerCase();
      let rawText = '';
      let hyperlinks = [];

      if (fileExt === 'pdf') {
        const pdfData = await pdfParse(buffer);
        rawText = pdfData.text;
        hyperlinks = await extractLinksFromPDF(buffer);
      } else if (fileExt === 'docx') {
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value;
        hyperlinks = await extractLinksFromDOCX(buffer);
      } else {
        return res.status(400).json({ error: 'Unsupported file format. Only PDF and DOCX are allowed.' });
      }

      const cleanedText = rawText
        .replace(/[^\x20-\x7E\n]/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');

      const urlRegex = /https?:\/\/[^\s)]+/g;
      const links = cleanedText.match(urlRegex) || [];

      const emailMatch = cleanedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = cleanedText.match(/(\+91[-\s]?|0)?\d{10}/);
      const nameMatch = cleanedText.match(/^([A-Z][a-z]+)\s([A-Z][a-z]+)/);

      let name = nameMatch ? nameMatch[0] : '';
      if (!name && emailMatch) {
        name = emailMatch[0].split('@')[0].replace(/[._-]/g, ' ');
        name = name
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      function extractSection(text, startKeyword, endKeyword) {
        const regex = new RegExp(`${startKeyword}[\\s\\S]*?(?=${endKeyword}|$)`, 'i');
        const match = text.match(regex);
        return match ? match[0].trim().split('\n').slice(1) : [];
      }

      const education = extractSection(cleanedText, 'Education', 'Experience|Projects|Skills|Achievements|Technical Skills|Positions');
      const experience = extractSection(cleanedText, 'Experience', 'Projects|Skills|Achievements|Technical Skills|Positions');
      const projects = extractSection(cleanedText, 'Projects|Personal Projects', 'Technical Skills|Skills|Achievements|Positions');
      const skills = extractSection(cleanedText, 'Technical Skills and Interests|Skills', 'Positions of Responsibility|Achievements|$');
      const achievements = extractSection(cleanedText, 'Achievements', 'Positions of Responsibility|$');
      const positions = extractSection(cleanedText, 'Positions of Responsibility', 'Achievements|$');

      const githubMatch = cleanedText.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-._]+/);
      const linkedinMatch = cleanedText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+/);

      const rawParsed = {
        name,
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        github: githubMatch ? githubMatch[0] : '',
        linkedin: linkedinMatch ? linkedinMatch[0] : '',
        education,
        experience,
        projects,
        skills,
        achievements,
        positions,
        links: [...links, ...hyperlinks],
      };

      const parsed = Object.fromEntries(
        Object.entries(rawParsed).filter(([_, val]) =>
          Array.isArray(val) ? val.length > 0 : !!val
        )
      );

      res.status(200).json({
        text: cleanedText,
        parsed,
      });

    } catch (parseErr) {
      console.error('Resume parsing error:', parseErr);
      res.status(500).json({ error: 'Failed to parse resume file' });
    }
  });
}
