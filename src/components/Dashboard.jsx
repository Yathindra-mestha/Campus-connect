import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import StudentForm from './StudentForm';
import StudentList from './StudentList';

const Dashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStudents(data);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const onStudentAdded = (newStudent) => {
        setStudents([newStudent, ...students]);
    };

    const onStudentDeleted = (id) => {
        setStudents(students.filter((s) => s.id !== id));
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Campus Connect Dashboard</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>

            <main className="dashboard-main">
                <StudentForm onStudentAdded={onStudentAdded} />
                <section className="student-section">
                    <h2>Student Directory</h2>
                    <StudentList
                        students={students}
                        loading={loading}
                        onDelete={onStudentDeleted}
                    />
                </section>
            </main>

            <style>{`
        .dashboard-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #edf2f7;
        }
        h1 { color: #2d3748; font-size: 1.5rem; }
        h2 { color: #4a5568; margin-bottom: 1rem; }
        .logout-btn {
          background: #e2e8f0;
          color: #4a5568;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
        }
        .logout-btn:hover { background: #cbd5e0; }
        .dashboard-main { display: flex; flex-direction: column; }
      `}</style>
        </div>
    );
};

export default Dashboard;
