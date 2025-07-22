import React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startParsing,
  setParsedText,
  setParsedData,
  setResumeError,
} from '@/redux/resumeSlice';
import { clearSuggestions } from '@/redux/suggestionSlice';


export default function ResumeUploader() {
  const dispatch = useDispatch();
  const { loading, error, text, parsed } = useSelector((state) => state.resume);
  const [file, setFile] = useState(null);



  const handleUpload = async () => {
    dispatch(clearSuggestions());
    console.log("🚀 Upload button clicked");
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF or DOCX files are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('File is too large. Max 2MB allowed.');
      return;
    }

    console.log("Uploading file:", file.name);
    dispatch(startParsing());

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Parsed text from backend:", data.text);
        console.log("🔍 Parsed structured data:", data.parsed);
        dispatch(setParsedText(data.text));
        dispatch(setParsedData(data.parsed));
      } else {
        console.error("API Error:", data.error);
        dispatch(setResumeError(data.error || 'Failed to parse resume.'));
      }
    } catch (err) {
      console.error("Request Failed:", err.message);
      dispatch(setResumeError(err.message));
    }
  };

  return (
    <div className="relative">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Upload Resume (PDF OR DOCX)
        </h2>

        <div className={`flex flex-col items-start gap-3 mb-4 w-full transition-opacity duration-200 ${
          loading ? `opacity-50 pointer-events-none` : ''}`}>
          <div className="flex items-center gap-4 w-full">
            {/* Styled label as button */}
            <label
            htmlFor="resumeUpload"
             className="bg-gray-500 hover:bg-gray-600 active:scale-95 text-white font-medium py-1 px-1 text-sm rounded-md cursor-pointer transition-all duration-200"
            >
              choose
            </label>
            {/* File name shown after selection */}
            <span className="text-sm text-gray-500">
              {file ? `✅ Selected: ${file.name}` : 'No file selected'}
            </span>
            
            {/* Hidden input */}
            <input
              id="resumeUpload"
              type="file"
              accept=".pdf,.docx"
              disabled={loading}
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* ✅ Grouped buttons: Upload & Clear */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Parsing...' : 'Upload & Parse'}
          </button>

          <button
            onClick={() => {
              setFile(null);
              dispatch(setParsedText(''));
              dispatch(setParsedData(null));
              dispatch(setResumeError(null));
              dispatch(clearSuggestions());
            }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-5 rounded-lg transition-all duration-200"
          >
            Clear
          </button>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {text && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800">Extracted Resume Text:</h3>
            <div className="bg-gray-100 p-3 mt-2 rounded-lg max-h-64 overflow-y-auto text-sm space-y-1 text-gray-800">
              {text.split('\n').map((line, index) => (
                <div key={index}>{line.replace(/[^\x20-\x7E]/g, '').trim()}</div>
              ))}
            </div>
          </div>
        )}

        {parsed && Object.keys(parsed).length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800">🔍 Structured Resume Info:</h3>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-2 text-sm text-gray-900 space-y-3">
              <div><strong>Name:</strong> {parsed.name || 'N/A'}</div>
              <div><strong>Email:</strong> {parsed.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {parsed.phone || 'N/A'}</div>

              {parsed.education?.length > 0 && (
                <div>
                  <strong>Education:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {parsed.education.map((line, idx) => <li key={idx}>{line}</li>)}
                  </ul>
                </div>
              )}

              {parsed.experience?.length > 0 && (
                <div>
                  <strong>Experience:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {parsed.experience.map((line, idx) => <li key={idx}>{line}</li>)}
                  </ul>
                </div>
              )}

              {parsed.projects?.length > 0 && (
                <div>
                  <strong>Projects:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {parsed.projects.map((line, idx) => <li key={idx}>{line}</li>)}
                  </ul>
                </div>
              )}

              {parsed.skills?.length > 0 && (
                <div>
                  <strong>Skills:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {parsed.skills.map((line, idx) => <li key={idx}>{line}</li>)}
                  </ul>
                </div>
              )}

              {parsed.achievements?.length > 0 && (
                <div>
                  <strong>Achievements:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {parsed.achievements.map((line, idx) => <li key={idx}>{line}</li>)}
                  </ul>
                </div>
              )}

              {parsed.positions?.length > 0 && (
                <div>
                  <strong>Positions of Responsibility:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {parsed.positions.map((line, idx) => <li key={idx}>{line}</li>)}
                  </ul>
                </div>
              )}
              {parsed.links?.length > 0 && (
                <div>
                  <strong>Extracted Links:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {parsed.links.map((link, idx) => {
                      let label = 'Link';
                      if (link.includes('linkedin.com')) label = 'LinkedIn';
                      else if (link.includes('github.com')) label = 'GitHub';
                      else if (link.includes('mailto:')) label = 'Email';
                      else if (link.includes('vercel.app') || link.includes('portfolio')) label = 'Portfolio';
                      
                      return (
                       <li key={idx}>
                         <strong>{label}:</strong>{' '}
                         <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {link}
                         </a>
                       </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🔁 Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-indigo-700 font-semibold">Parsing Resume...</p>
        </div>
      )}
    </div>
  );
}
