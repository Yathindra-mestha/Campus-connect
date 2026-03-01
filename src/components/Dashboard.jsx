import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import StudentForm from './StudentForm';
import StudentList from './StudentList';

const Dashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getInitialData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                fetchProfile(session.user.id);
            }
            fetchStudents();
        };
        getInitialData();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('name, branch, social_links, avatar_url')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setUserProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err.message);
        }
    };

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
                <h1>Welcome, {userProfile?.name || 'User'}</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>

            <section className="profile-info">
                <div className="profile-card">
                    <div className="profile-header">
                        {userProfile?.avatar_url && <img src={userProfile.avatar_url} alt="Profile" className="avatar" />}
                        <div>
                            <h2>{userProfile?.name}</h2>
                            <p className="branch-text">{userProfile?.branch || 'No branch specified'}</p>
                        </div>
                    </div>
                    <div className="social-links">
                        {userProfile?.social_links?.linkedin && (
                            <a href={userProfile.social_links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                        )}
                        {userProfile?.social_links?.github && (
                            <a href={userProfile.social_links.github} target="_blank" rel="noreferrer">GitHub</a>
                        )}
                        {userProfile?.social_links?.instagram && (
                            <a href={userProfile.social_links.instagram} target="_blank" rel="noreferrer">Instagram</a>
                        )}
                    </div>
                </div>
            </section>

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
        .profile-info { margin-bottom: 2rem; }
        .profile-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .profile-header { display: flex; align-items: center; gap: 1rem; }
        .avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
        .branch-text { color: #718096; font-size: 0.9rem; }
        .social-links { display: flex; gap: 1rem; }
        .social-links a {
          color: #667eea;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .social-links a:hover { text-decoration: underline; }
      `}</style>
        </div>
    );
};

export default Dashboard;
