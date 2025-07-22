import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  startFetch,
  setScholarProfile,
  setScholarError,
} from '../redux/scholarSlice';
import { clearSuggestions } from '../redux/suggestionSlice';

export default function ScholarInput() {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.scholar);
  const [url, setUrl] = useState('');

  const handleFetch = async () => {
    if (!url.includes('scholar.google.com')) {
      alert('Please enter a valid Google Scholar URL');
      return;
    }
    dispatch(clearSuggestions());
    dispatch(startFetch());

    try {
      const res = await fetch('/api/fetch-scholar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrl: url }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch Scholar data');

      dispatch(setScholarProfile(data));
    } catch (err) {
      dispatch(setScholarError(err.message));
    }
  };

  const handleClear = () => {
    setUrl('');
    dispatch(setScholarProfile(null));
    dispatch(setScholarError(null));
    dispatch(clearSuggestions());
  };


  return (
    <div className="p-4 border rounded bg-white shadow mt-4">
      <h2 className="text-lg font-bold mb-2">Google Scholar Profile</h2>
      <input
        type="text"
        placeholder="Enter Google Scholar Profile URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-2"
      />
      <div className="flex gap-3 mt-2">
        <button
          onClick={handleFetch}
    
          disabled={loading}
    
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch Scholar Data'}
        </button>
        
        <button
          onClick={handleClear}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-5 rounded-lg transition-all duration-200"
        >
          Clear
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">Error: {error}</p>}

      {profile && (
        <div className="mt-4 text-sm">
          <h3 className="font-semibold">Scholar Info:</h3>
          <pre className="bg-gray-100 p-2 overflow-auto text-sm whitespace-pre-wrap break-words max-w-full">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
