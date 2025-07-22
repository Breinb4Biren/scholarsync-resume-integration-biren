// lib/extractLinksFromDOCX.js
import unzipper from 'unzipper';
import { parseStringPromise } from 'xml2js';

export async function extractLinksFromDOCX(buffer) {
  const hyperlinks = [];

  try {
    const zip = await unzipper.Open.buffer(buffer);
    const relsFile = zip.files.find(f => f.path === 'word/_rels/document.xml.rels');

    if (!relsFile) return [];

    const relsContent = await relsFile.buffer();
    const relsXml = await parseStringPromise(relsContent);

    const relationships = relsXml.Relationships.Relationship || [];

    for (const rel of relationships) {
      if (rel.$.Type.includes('hyperlink')) {
        hyperlinks.push(rel.$.Target);
      }
    }

    return hyperlinks;
  } catch (err) {
    console.error('Error extracting DOCX links:', err);
    return [];
  }
}
