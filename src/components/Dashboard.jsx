import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import StudentForm from './StudentForm';
import StudentList from './StudentList';

const Dashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        branch: '',
        avatar_url: '',
        social_links: { linkedin: '', github: '', instagram: '' }
    });
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
            setEditData({
                branch: data.branch || '',
                avatar_url: data.avatar_url || '',
                social_links: {
                    linkedin: data.social_links?.linkedin || '',
                    github: data.social_links?.github || '',
                    instagram: data.social_links?.instagram || ''
                }
            });
        } catch (err) {
            console.error('Error fetching profile:', err.message);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { error } = await supabase
                .from('users')
                .update({
                    branch: editData.branch,
                    avatar_url: editData.avatar_url,
                    social_links: editData.social_links
                })
                .eq('id', session.user.id);

            if (error) throw error;

            fetchProfile(session.user.id);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Error updating profile: ' + err.message);
        } finally {
            setLoading(false);
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
                <div className="header-actions">
                    <Link to="/members" className="members-btn">Members Directory</Link>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <section className="profile-info">
                <div className="profile-card">
                    {!isEditing ? (
                        <>
                            <div className="profile-header">
                                {userProfile?.avatar_url ? (
                                    <img src={userProfile.avatar_url} alt="Profile" className="avatar" />
                                ) : (
                                    <div className="avatar-placeholder">{userProfile?.name?.charAt(0) || '?'}</div>
                                )}
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
                                <button onClick={() => setIsEditing(true)} className="edit-btn">Edit Profile</button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                            <h3>Edit Profile Details</h3>
                            <div className="edit-grid">
                                <div className="edit-group">
                                    <label>Branch</label>
                                    <input
                                        type="text"
                                        value={editData.branch}
                                        onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                                        placeholder="e.g. CS, ME"
                                    />
                                </div>
                                <div className="edit-group">
                                    <label>Avatar URL</label>
                                    <input
                                        type="text"
                                        value={editData.avatar_url}
                                        onChange={(e) => setEditData({ ...editData, avatar_url: e.target.value })}
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>
                                <div className="edit-group">
                                    <label>LinkedIn</label>
                                    <input
                                        type="text"
                                        value={editData.social_links.linkedin}
                                        onChange={(e) => setEditData({
                                            ...editData,
                                            social_links: { ...editData.social_links, linkedin: e.target.value }
                                        })}
                                        placeholder="LinkedIn Profile URL"
                                    />
                                </div>
                                <div className="edit-group">
                                    <label>GitHub</label>
                                    <input
                                        type="text"
                                        value={editData.social_links.github}
                                        onChange={(e) => setEditData({
                                            ...editData,
                                            social_links: { ...editData.social_links, github: e.target.value }
                                        })}
                                        placeholder="GitHub Profile URL"
                                    />
                                </div>
                                <div className="edit-group">
                                    <label>Instagram</label>
                                    <input
                                        type="text"
                                        value={editData.social_links.instagram}
                                        onChange={(e) => setEditData({
                                            ...editData,
                                            social_links: { ...editData.social_links, instagram: e.target.value }
                                        })}
                                        placeholder="Instagram Profile URL"
                                    />
                                </div>
                            </div>
                            <div className="edit-actions">
                                <button type="submit" className="save-btn" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                            </div>
                        </form>
                    )}
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
        .header-actions { display: flex; gap: 1rem; align-items: center; }
        .members-btn {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
        }
        .members-btn:hover { text-decoration: underline; }
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
        .edit-btn {
          margin-left: auto;
          background: none;
          border: 1px solid #667eea;
          color: #667eea;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .edit-btn:hover { background: #667eea; color: white; }
        
        .edit-profile-form { width: 100%; }
        .edit-profile-form h3 { margin-top: 0; margin-bottom: 1.5rem; color: #4a5568; }
        .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        .edit-group { text-align: left; }
        .edit-group label { display: block; font-size: 0.8rem; color: #718096; margin-bottom: 0.3rem; }
        .edit-group input { 
          width: 100%; padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 4px; 
          font-size: 0.9rem; font-family: inherit;
        }
        .edit-group input:focus { outline: none; border-color: #667eea; }
        .edit-actions { display: flex; gap: 1rem; }
        .save-btn { 
          background: #667eea; color: white; border: none; padding: 0.6rem 1.2rem; 
          border-radius: 6px; font-weight: 600; cursor: pointer; 
        }
        .cancel-btn { 
          background: #edf2f7; color: #4a5568; border: none; padding: 0.6rem 1.2rem; 
          border-radius: 6px; font-weight: 600; cursor: pointer; 
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
