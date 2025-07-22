import ResumeUploader from '@/components/ResumeUploader';
import ScholarInput from '../components/ScholarInput';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestions } from '@/redux/suggestionSlice';

export default function Home() {
  const dispatch = useDispatch();

  const resumeData = useSelector((state) => state.resume.parsed);
  const scholarData = useSelector((state) => state.scholar.profile);
  const suggestions = useSelector((state) => state.suggestions.suggestions);
  const loading = useSelector((state) => state.suggestions.loading);

  // Allow suggestion with either resume or scholar profile
  const handleGetSuggestions = () => {
    if (!resumeData && !scholarData) {
      alert('Upload at least resume or scholar profile!');
      return;
    }
    console.log("📦 Triggered: Get Project Suggestions (From Redux State)");
    console.log("Resume Data from Redux:", resumeData);
    console.log("Scholar Data from Redux:", scholarData);
    dispatch(fetchSuggestions({ resumeData, scholarData }));
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
        ScholarSync – Resume & Scholar Integration
      </h1>

      <div className="max-w-3xl mx-auto space-y-10">
        <ResumeUploader />
        <ScholarInput />

        {/* Original Suggestion Button */}
        <div className="text-center">
          <button
            onClick={handleGetSuggestions}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {loading
            ? 'Suggesting...'
            : resumeData && scholarData
            ? 'Suggest from Resume + Scholar'
            : resumeData
            ? 'Suggest from Resume only'
            : scholarData
            ? 'Suggest from Scholar only'
            : 'Suggest Projects'}
          </button>
        </div>

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2 text-center">Suggested Projects</h2>
            {/* Info tag based on source */}
            <p className="text-sm text-center text-gray-600 mb-3">
              {resumeData && scholarData
              ? '🔍 Based on Resume + Scholar Profile'
              : resumeData
              ? '📄 Based on Resume only'
              : '🎓 Based on Scholar Profile only'}
            </p>
            <ul className="space-y-3">
              {suggestions.map((s, i) => (
                <li key={i} className="p-3 bg-blue-100 rounded shadow">{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
