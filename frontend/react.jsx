import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { unpack } from 'msgpackr';

const API_URL = 'http://localhost:3000/api/records';
const PREVIEW_COUNT = 20;

const RecordsApp = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [durationMs, setDurationMs] = useState(null);

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            setError(null);
            const start = performance.now();
            try {
                const response = await fetch(API_URL, {
                    headers: { Accept: 'application/msgpack' }
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const buffer = await response.arrayBuffer();
                const decoded = unpack(new Uint8Array(buffer));

                setRecords(Array.isArray(decoded.records) ? decoded.records : []);
                setDurationMs(performance.now() - start);
            } catch (err) {
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    const preview = useMemo(() => records.slice(0, PREVIEW_COUNT), [records]);

    if (loading) {
        return <p>Loading records…</p>;
    }

    if (error) {
        return <p>Failed to load records: {error}</p>;
    }

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', padding: '1rem' }}>
            <h1>MsgPack Records Viewer</h1>
            <p>
                Loaded {records.length.toLocaleString()} records
                {durationMs != null ? ` in ${durationMs.toFixed(1)} ms.` : '.'}
            </p>
            <p>Showing the first {Math.min(records.length, PREVIEW_COUNT)} records:</p>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr>
                        <th style={cellStyle}>ID</th>
                        <th style={cellStyle}>Title</th>
                        <th style={cellStyle}>Category</th>
                        <th style={cellStyle}>Score</th>
                        <th style={cellStyle}>Active</th>
                    </tr>
                </thead>
                <tbody>
                    {preview.map((record) => (
                        <tr key={record.id}>
                            <td style={cellStyle}>{record.id}</td>
                            <td style={cellStyle}>{record.title}</td>
                            <td style={cellStyle}>{record.category}</td>
                            <td style={cellStyle}>{record.score}</td>
                            <td style={cellStyle}>{record.active ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const cellStyle = {
    border: '1px solid #ccc',
    padding: '0.5rem',
    textAlign: 'left'
};

export default RecordsApp;

const rootElement = typeof document !== 'undefined' ? document.getElementById('root') : null;

if (rootElement) {
    createRoot(rootElement).render(<RecordsApp />);
}
