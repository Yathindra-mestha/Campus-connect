import React from 'react';
import { supabase } from '../lib/supabaseClient';

const StudentList = ({ students, loading, onDelete }) => {
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;

        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', id);

            if (error) throw error;
            onDelete(id);
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="loading">Loading students...</div>;

    if (students.length === 0) return <div className="empty">No students found. Add one above!</div>;

    return (
        <div className="list-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td>{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.department}</td>
                            <td>
                                <button onClick={() => handleDelete(student.id)} className="delete-btn">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
        .list-container {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th, td {
          padding: 1rem;
          border-bottom: 1px solid #edf2f7;
        }
        th { background: #f7fafc; color: #4a5568; }
        .delete-btn {
          background: #fed7d7;
          color: #c53030;
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .delete-btn:hover { background: #feb2b2; }
        .loading, .empty {
          text-align: center;
          padding: 2rem;
          color: #718096;
        }
      `}</style>
        </div>
    );
};

export default StudentList;
