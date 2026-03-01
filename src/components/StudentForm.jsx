import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const StudentForm = ({ onStudentAdded }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('students')
                .insert([{ name, email, department }])
                .select();

            if (error) throw error;

            setName('');
            setEmail('');
            setDepartment('');
            if (onStudentAdded) onStudentAdded(data[0]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-card">
            <h3>Add New Student</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Student'}
                    </button>
                </div>
            </form>
            {error && <p className="error">{error}</p>}

            <style>{`
        .form-card {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 2rem;
        }
        h3 { margin-bottom: 1rem; color: #2d3748; }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        input {
          padding: 0.65rem;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
        }
        button {
          background: #3182ce;
          color: white;
          border: none;
          padding: 0.65rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
        }
        .error { color: #c53030; margin-top: 0.5rem; font-size: 0.85rem; }
      `}</style>
        </div>
    );
};

export default StudentForm;
