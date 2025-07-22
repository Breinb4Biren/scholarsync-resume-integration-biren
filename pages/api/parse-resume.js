import { extractLinksFromPDF } from '@/lib/extractLinks';
import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const file = Array.isArray(files.resume) ? files.resume[0] : files.resume;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const filePath = file.filepath || file.path;
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const hyperlinks = await extractLinksFromPDF(filePath);
      console.log("🔗 Extracted Links from Annotations:", hyperlinks);

      //Clean and normalize the PDF text
      const cleanedText = pdfData.text
        .replace(/[^\x20-\x7E\n]/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
        const urlRegex = /https?:\/\/[^\s)]+/g;
        const links = cleanedText.match(urlRegex) || [];
        console.log("🧪 CleanedText Preview:\n", cleanedText.slice(0, 800));

      // Pattern matches
      const emailMatch = cleanedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = cleanedText.match(/(\+91[-\s]?|0)?\d{10}/);
      const nameMatch = cleanedText.match(/^([A-Z][a-z]+)\s([A-Z][a-z]+)/);

      // Fallback for name from email
      let name = nameMatch ? nameMatch[0] : '';
      if (!name && emailMatch) {
        name = emailMatch[0].split('@')[0].replace(/[._-]/g, ' ');
        name = name
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      // Section extractor helper
      function extractSection(text, startKeyword, endKeyword) {
        const regex = new RegExp(`${startKeyword}[\\s\\S]*?(?=${endKeyword}|$)`, 'i');
        const match = text.match(regex);
        return match ? match[0].trim().split('\n').slice(1) : [];
      }

      // Extract all major sections
      const education = extractSection(cleanedText, 'Education', 'Experience|Projects|Skills|Achievements|Technical Skills|Positions');
      const experience = extractSection(cleanedText, 'Experience', 'Projects|Skills|Achievements|Technical Skills|Positions');
      const projects = extractSection(cleanedText, 'Projects|Personal Projects', 'Technical Skills|Skills|Achievements|Positions');
      const skills = extractSection(cleanedText, 'Technical Skills and Interests|Skills', 'Positions of Responsibility|Achievements|$');
      const achievements = extractSection(cleanedText, 'Achievements', 'Positions of Responsibility|$');
      const positions = extractSection(cleanedText, 'Positions of Responsibility', 'Achievements|$');
      // Extract socials
      const githubMatch = cleanedText.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-._]+/);
      const linkedinMatch = cleanedText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+/);


      //  Build structured object
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
        links : [...links, ...hyperlinks],
      };

      //Remove empty values (clean object)
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
      console.error('PDF parsing error:', parseErr);
      res.status(500).json({ error: 'Failed to parse PDF' });
    }
  });
}
